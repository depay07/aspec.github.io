# Naver project cases

The website stores reviewed project content in `data/case-studies.json`.
It does not fetch Naver posts at runtime, and no scheduled import is configured.

The 2026-11-09 update adds four missing posts and 17 source photographs.
Existing case records and detail pages were preserved. Robot photographs are
identified as office tests, as stated in the source. Conflicting camera counts
in the rice-cooker source were intentionally omitted.

## Check coverage

Run `python scripts/import-reviewed-blog-cases.py` from the repository root.
Exit code 0 means all category posts are represented; 1 means missing posts.
Network or source-format errors fail visibly rather than reporting no omissions.
The current checker stops if the category exceeds 30 posts; pagination must be
implemented before using it for larger categories.

## Reviewed import

Review each source and add its content to `data/blog-case-additions.json`.
Install `beautifulsoup4`, then run
`python scripts/import-reviewed-blog-cases.py --apply`.
Only reviewed entries with new slugs are imported. Existing detail pages are
not regenerated. Check source images, descriptions, links, mobile layout and
the Git diff before publishing. This command is not an automatic publishing job.

Source URLs, photograph counts and review notes are recorded in
`docs/blog-case-import-2026-11.json`.
