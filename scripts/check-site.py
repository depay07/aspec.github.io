#!/usr/bin/env python3
"""Validate published URLs, structured data, assets and enquiry links without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOST = 'www.aspec-tech.co.kr'
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links = []; self.ids = set(); self.canonicals = []; self.schemas = []; self.schema = None
        self.h1 = 0; self.description = ''; self.menu = False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.add(attrs['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'meta' and attrs.get('name') == 'description': self.description = attrs.get('content', '')
        if tag == 'details' and 'site-mobile-menu' in attrs.get('class', ''): self.menu = True
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonicals.append(attrs.get('href'))
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.schema = ''
        for attribute in ('href', 'src', 'poster'):
            if attrs.get(attribute): self.links.append(attrs[attribute])
    def handle_data(self, data):
        if self.schema is not None: self.schema += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema)); self.schema = None

def main():
    urls = [node.text for node in ET.parse(ROOT/'sitemap.xml').findall('{*}url/{*}loc')]
    assert len(urls) == len(set(urls)), 'Duplicate sitemap URL'
    pages = {}; errors = []
    for url in urls:
        rel = unquote(urlsplit(url).path).lstrip('/') or 'index.html'
        path = ROOT/rel
        if not path.is_file(): errors.append(f'Missing sitemap file: {rel}'); continue
        page = Page(path.read_text()); pages[path.resolve()] = page
        if page.canonicals != [url]: errors.append(f'Canonical mismatch: {rel}')
        if page.h1 != 1 or not page.description: errors.append(f'Missing/duplicate H1 or description: {rel}')
        if not page.menu: errors.append(f'Missing mobile menu: {rel}')
        for schema in page.schemas:
            for node in schema.get('@graph', [schema]):
                if node.get('@type') == 'Product' and not any(k in node for k in ('offers','review','aggregateRating')):
                    errors.append(f'Incomplete Product: {rel}')
    for path, page in pages.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme not in ('', 'http', 'https') or (url.netloc and url.netloc != HOST): continue
            target = ROOT/unquote(url.path).lstrip('/') if url.path.startswith('/') else path.parent/unquote(url.path)
            if not url.path: target = path
            if target.is_dir(): target /= 'index.html'
            target = target.resolve()
            if not target.is_file(): errors.append(f'{path.relative_to(ROOT)} → missing {link}'); continue
            if url.fragment and target.suffix == '.html':
                target_page = pages.get(target) or Page(target.read_text())
                if unquote(url.fragment) not in target_page.ids: errors.append(f'{path.relative_to(ROOT)} → missing anchor {link}')
    assert not errors, '\n'.join(errors)
    print(f'PASS: {len(urls)} published pages; JSON-LD, canonical, H1, descriptions, mobile menus, assets, links and anchors.')
if __name__ == '__main__': main()
