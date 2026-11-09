#!/usr/bin/env python3
"""Check Naver project coverage, or import explicitly reviewed case data.

Requires beautifulsoup4 for --apply. New, unreviewed posts are only reported.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
LEGACY_IDS = {
    "224329202335", "224328586312", "224328573867",
    "224328568872", "224327495696", "224327491222",
}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    data_path = ROOT / "data/case-studies.json"
    payload = json.loads(data_path.read_text(encoding="utf-8"))
    manifest = json.loads((ROOT / "data/blog-case-additions.json").read_text(encoding="utf-8"))
    raw = fetch("https://blog.naver.com/PostTitleListAsync.naver?blogId=aspec-tech&currentPage=1&categoryNo=6&countPerPage=30").decode("utf-8")
    # Naver emits an invalid JSON escape in the unrelated pagingHtml field.
    listing = json.loads(raw.replace("\\'", "'"))
    if int(listing["totalCount"]) > len(listing["postList"]):
        raise RuntimeError("Category exceeds one page; extend pagination before importing")
    known = set(LEGACY_IDS)
    for case in payload["cases"]:
        provenance = case.get("source", {})
        if isinstance(provenance, dict):
            known.add(str(provenance.get("postId", "")))
        # Earlier imports keep provenance under sourceBlog.
        for value in case.values():
            if isinstance(value, dict) and "sourceUrl" in value:
                known.add(value["sourceUrl"].rstrip("/").split("/")[-1])
    posts = {p["logNo"]: p for p in listing["postList"]}
    missing = [p for p in listing["postList"] if p["logNo"] not in known]
    for post in missing:
        print(post["logNo"], urllib.parse.unquote_plus(post["title"]))
    print(f'category_posts={len(posts)} missing={len(missing)}')
    if not args.apply:
        return 1 if missing else 0

    from bs4 import BeautifulSoup
    additions, records = [], []
    existing_slugs = {case["slug"] for case in payload["cases"]}
    for reviewed in manifest["cases"]:
        if reviewed["slug"] in existing_slugs:
            continue
        pid = reviewed["postId"]
        if pid not in posts:
            raise RuntimeError(f"Post {pid} is not public in category 6")
        source_url = f"https://blog.naver.com/aspec-tech/{pid}"
        page = fetch(f"https://blog.naver.com/PostView.naver?blogId=aspec-tech&logNo={pid}")
        body = BeautifulSoup(page, "html.parser").select_one(".se-main-container")
        if body is None:
            raise RuntimeError(f"Missing body: {pid}")
        images = []
        seen = set()
        for img in body.select("img.se-image-resource"):
            url = img.get("data-lazy-src") or img.get("src")
            if not url or url in seen or "ChatGPT_Image" in url:
                continue
            seen.add(url)
            if urllib.parse.urlparse(url).hostname not in {"postfiles.pstatic.net", "blogfiles.pstatic.net"}:
                raise RuntimeError(f"Unexpected image host: {url}")
            image = fetch(url)
            if image.startswith(b"\xff\xd8\xff"):
                ext = "jpg"
            elif image.startswith(b"\x89PNG"):
                ext = "png"
            else:
                raise RuntimeError(f"Unsupported image: {url}")
            relative = f'images/case-studies/{reviewed["slug"]}/{len(images)+1:02}.{ext}'
            destination = ROOT / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(image)
            caption = reviewed["imageCaption"] + f" {len(images)+1}"
            images.append({"src": relative, "alt": caption, "caption": caption})
        if not images:
            raise RuntimeError(f"No project images: {pid}")
        case = {k: v for k, v in reviewed.items() if k not in {"postId", "reviewNote", "imageCaption"}}
        case.update(
            published=True, lastmod=manifest["reviewedOn"], categoryLabel=reviewed["industry"],
            heroImage=images[0]["src"], heroImageAlt=images[0]["alt"],
            cardImage=images[0]["src"], cardImageAlt=images[0]["alt"], images=images,
            keywords=[reviewed["title"], *reviewed["technologies"]],
            highlights=reviewed["results"][:3], relatedCases=[],
            projectSummary={"inspectionTarget": reviewed["industry"], "inspectionPurpose": reviewed["summary"]},
            source={"postId": pid, "sourceUrl": source_url, "reviewedOn": manifest["reviewedOn"]},
        )
        additions.append(case)
        records.append({"postId": pid, "sourceUrl": source_url, "slug": reviewed["slug"], "imageCount": len(images), "reviewNote": reviewed.get("reviewNote", "")})

    if not additions:
        print("No reviewed additions to import")
        return 0
    payload["cases"] = additions + payload["cases"]
    spec = importlib.util.spec_from_file_location("case_builder", ROOT / "scripts/build-case-studies.py")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.validate_cases(payload["cases"])
    template = builder.TEMPLATE_PATH.read_text(encoding="utf-8")
    template = template.replace('</head>', '<link rel="stylesheet" href="../redesign.css">\n</head>')
    template = template.replace('<body class="', '<body class="page-case-detail ', 1)
    lookup = {case["slug"]: case for case in payload["cases"]}
    for case in additions:
        rendered = builder.render_detail(case, lookup, template)
        builder.write_preserving_newlines(builder.OUTPUT_DIR / (case["slug"] + ".html"), rendered)
    write_json(data_path, payload)
    builder.write_preserving_newlines(builder.PORTFOLIO_PATH, builder.build_portfolio(payload["cases"]))
    builder.write_preserving_newlines(builder.SITEMAP_PATH, builder.build_sitemap(payload["cases"]))
    write_json(ROOT / "docs/blog-case-import-2026-11.json", {"importedOn": manifest["reviewedOn"], "sources": records})
    print(f"Imported {len(additions)} cases; existing detail pages left unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
