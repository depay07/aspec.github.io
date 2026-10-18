#!/usr/bin/env python3
"""Render HIKROBOT series pages, catalog cards, structured data and sitemap entries."""
import argparse,html,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CATEGORIES={'sensor':'비전센서','smart':'AI 스마트카메라','fixed':'고정식 리더기','logistics':'물류용 리더기','handheld':'핸드형 리더기'}
def esc(v):return html.escape(str(v),quote=True)
def write(path,content,check,changed):
 if not path.exists() or path.read_text()!=content:
  changed.append(str(path.relative_to(ROOT)))
  if not check:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
def panels(items):return '<div class="detail-grid">'+''.join('<article class="detail-panel"><h3>'+esc(a)+'</h3><p>'+esc(b)+'</p></article>' for a,b in items)+'</div>'
def section(n,title,body,alt=False):return f'<section class="detail-section{" detail-section-alt" if alt else ""}"><div class="section-inner"><p class="section-kicker">{esc(n)}</p><h2>{esc(title)}</h2>{body}</div></section>'
def card(p):
 keys=' '.join(['hikrobot 하이크로봇 하이로봇',p['name'],p['slug'],p['kind'],p['keyline'],*p['tasks'],*[x[0] for x in p['models']]])
 return f'''<article class="product-card" data-category="{esc(p['category'])}" data-keywords="{esc(keys.lower())}"><div class="product-visual"><img class="product-image" src="{esc(p['image'])}" alt="HIKROBOT {esc(p['name'])} {esc(p['kind'])}" loading="lazy" decoding="async"></div><div class="product-card-body"><p class="product-category">{esc(p['kind'])}</p><h3 class="product-name">{esc(p['name'])}</h3><p class="product-keyline">{esc(p['keyline'])}</p><p class="product-description">{esc(' · '.join(p['tasks'][:3]))}</p><div class="product-actions"><a href="products/hikrobot/{esc(p['slug'])}.html" class="product-action product-action-primary" aria-label="HIKROBOT {esc(p['name'])} 제품 상세보기">제품 상세보기</a></div></div></article>'''
def render(p,products,catalog,template):
 name=p['name'];url='https://www.aspec-tech.co.kr/products/hikrobot/'+p['slug']+'.html';image='https://www.aspec-tech.co.kr/'+p['image'];title='하이크로봇 HIKROBOT '+name+' | '+p['kind']+' | ASPEC';description='HIKROBOT '+name+'. '+p['summary']
 schemas={'@context':'https://schema.org','@graph':[{'@type':'WebPage','name':title,'url':url,'description':description,'inLanguage':'ko-KR','about':{'@type':'Thing','name':'HIKROBOT '+name},'primaryImageOfPage':{'@type':'ImageObject','url':image},'publisher':{'@id':'https://www.aspec-tech.co.kr/#organization'}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i,'name':a,'item':b} for i,(a,b) in enumerate([('홈','https://www.aspec-tech.co.kr/'),('제품·솔루션','https://www.aspec-tech.co.kr/products.html'),('Hikrobot','https://www.aspec-tech.co.kr/products.html#hikrobot-products-heading'),(name,url)],1)]}]}
 breadcrumb=f'<div class="breadcrumb-wrap"><nav class="section-inner breadcrumb" aria-label="Breadcrumb"><a href="/">홈</a><span>›</span><a href="/products.html">제품·솔루션</a><span>›</span><a href="/products.html#hikrobot-products-heading">Hikrobot</a><span>›</span><span aria-current="page">{esc(name)}</span></nav></div>'
 actions=f'<div class="detail-actions"><a class="detail-button detail-button-primary" href="/contact.html?service=hikrobot#contact-form">{esc(name)} 견적·샘플 테스트 문의</a><a class="detail-button detail-button-secondary" href="tel:01096795522">전화 상담</a></div>'
 hero=f'<header class="detail-hero"><div class="section-inner detail-hero-grid"><div><p class="detail-category">HIKROBOT · {esc(p["kind"])}</p><h1 class="detail-title">HIKROBOT {esc(name)}</h1><p class="hik-product-keyline">{esc(p["keyline"])}</p><p class="detail-summary">{esc(p["summary"])}</p>{actions}</div><div class="product-visual detail-visual"><img class="product-image" src="/{esc(p["image"])}" alt="HIKROBOT {esc(name)} {esc(p["kind"])}" fetchpriority="high"></div></div></header>'
 overview='<p class="detail-section-lead">'+esc(p['summary'])+'</p>'
 overview+='<p class="detail-section-lead">'+esc('선정 기준: '+('검사 시야(FOV), 작업거리(WD), 최소 결함 크기, 제품 색상과 촬영 조건.' if p['category'] in ('sensor','smart') else '코드 종류·최소 모듈 크기, 제품 재질, 판독 거리, 이동 속도와 통신 방식.'))+'</p>'
 body=section('01 · Overview','제품 개요',overview)
 body+=section('02 · Key Features','주요 특징',panels(p['features']),True)
 body+=section('03 · Application Fit','주요 적용 분야',panels(p['applications']))
 headings=['대표 모델·계열','해상도','연결 방식' if p['category']=='handheld' else ('최대 라인 주파수' if p['slug']=='id7000' else '최대 프레임레이트'),'구성·선정 항목']
 table='<div class="hik-spec-wrap" role="region" aria-label="'+esc(name)+' 대표 모델 사양" tabindex="0"><table class="hik-spec-table"><caption>'+esc(name)+' 대표 모델 비교</caption><thead><tr>'+''.join('<th scope="col">'+esc(x)+'</th>' for x in headings)+'</tr></thead><tbody>'
 for row in p['models']:table+='<tr><th scope="row">'+esc(row[0])+'</th>'+''.join('<td>'+esc(x)+'</td>' for x in row[1:])+'</tr>'
 table+='</tbody></table></div><p class="spec-note">제조사 카탈로그의 대표 모델 기준. 표의 계열명은 전체 주문코드를 뜻하지 않으며 렌즈·광원·통신·펌웨어와 제품 세대에 따라 세부 사양이 달라질 수 있습니다.'
 if p['category']!='handheld':table+=' 프레임레이트는 영상 취득·처리 조건의 사양으로, 검사 완료 속도나 초당 판독 수와는 별도 항목입니다.'
 table+=' 최종 선정 시 전체 주문코드와 대상 샘플로 확인해 주세요.</p>'
 body+=section('04 · Model & Specification','대표 모델과 주요 사양',table,True)
 body+=section('05 · Inspection Tasks','적용 가능한 검사·판독','<ul class="detail-list">'+''.join('<li>'+esc(x)+'</li>' for x in p['tasks'])+'</ul>')
 support=['샘플 확인','모델·광학 선정','트리거·배선 검토','PLC·MES 연동','운영 프로그램 구성','현장 셋업']
 body+=section('06 · ASPEC Engineering','ASPEC 지원 범위','<p class="detail-section-lead">장비 공급부터 렌즈·조명 선정, 검사 프로그램과 생산설비 연동까지.</p><ol class="support-steps">'+''.join('<li class="support-step">'+esc(x)+'</li>' for x in support)+'</ol>',True)
 related=[x for x in products if x['slug']!=p['slug'] and x['category']==p['category']]
 if len(related)<2:related += [x for x in products if x['slug']!=p['slug'] and x not in related and (x['slug'].startswith('sc')==p['slug'].startswith('sc'))]
 links='<div class="related-grid">'+''.join(f'<a class="related-card" href="{esc(x["slug"])}.html"><span>{esc(x["kind"])}</span><strong>{esc(x["name"])}</strong><p>{esc(x["keyline"])}</p></a>' for x in related[:3])+'</div><p class="detail-section-lead"><a href="/portfolio.html">ASPEC 머신비전 구축사례 보기 →</a></p>'
 body+=section('07 · Related Products','함께 검토할 제품',links)
 if p['category'] in ('sensor','smart'):
  faq=[('스마트카메라만으로 검사가 가능한가요?','카메라 내부에서 지원하는 도구로 검사를 구성할 수 있습니다. 여러 카메라의 통합 화면, 통계, 이미지 저장이나 별도 설비 통신은 운영 프로그램을 함께 검토할 수 있습니다.'),('AI 기능은 모든 모델에서 동일한가요?','지원 알고리즘과 모델 크기, 입력 해상도는 제품·펌웨어별로 차이가 있습니다. 필요한 분류·검출·OCR·세그멘테이션 기능을 지정해 모델을 확인하는 것이 좋습니다.'),('카메라 해상도는 어떻게 정하나요?','검사 시야와 최소 결함 크기를 기준으로 필요한 픽셀 수를 계산한 뒤, 렌즈·작업거리·노출과 택타임을 함께 확인합니다.')]
 elif p['category']=='handheld':
  faq=[('유선형과 무선형의 통신은 같은가요?','본체·베이스와 주문코드에 따라 USB, Bluetooth, RF, Ethernet 및 산업용 프로토콜 지원 여부가 다릅니다. 연결할 장치와 데이터 형식을 기준으로 선택해 주세요.'),('금속 DPM도 읽을 수 있나요?','마킹 방식, 코드 크기와 표면 반사에 따라 달라집니다. DPM이 주요 대상이면 IDH3000 등 대응 제품군과 실제 샘플로 판독 조건을 비교할 수 있습니다.'),('키보드 입력처럼 사용할 수 있나요?','USB HID 지원 모델은 키보드 입력 방식으로 사용할 수 있습니다. 전용 프로그램·설비와 연결할 때는 CDC·SDK·산업용 통신 지원 모델을 구분해야 합니다.')]
 else:
  faq=[('프레임레이트가 판독 속도인가요?','영상 취득·처리 프레임레이트와 초당 코드 판독 수, 실제 라인 처리 속도는 서로 다른 값입니다. 노출·광량·코드 수와 통신 시간을 포함해 확인해야 합니다.'),('설치 거리와 렌즈는 어떻게 정하나요?','최소 코드 모듈 크기, 판독 범위, 작업거리와 제품 높이 편차를 기준으로 센서·렌즈·조명을 선정합니다.'),('기존 PLC·MES에 연결할 수 있나요?','지원 인터페이스·프로토콜과 기존 데이터 형식을 확인한 뒤 리더기, PLC 또는 중계 프로그램을 통한 결과 전달 구성을 검토할 수 있습니다.')]
 body+=section('08 · FAQ','제품 선정 FAQ','<div class="detail-faq">'+''.join('<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>' for q,a in faq)+'</div>',True)
 sources='<p class="detail-section-lead"><a href="'+esc(catalog['url'])+'">HIKROBOT 제조사 제품 카탈로그</a> · 참조 페이지 '+esc(', '.join(map(str,p['catalogPages'])))+'</p>'
 if p.get('sourceUrl'):sources+='<p class="detail-section-lead"><a href="'+esc(p['sourceUrl'])+'">HIKROBOT 공식 제품 정보</a></p>'
 body+=section('09 · Product Resources','제품 자료',sources)
 body+=section('10 · Project Inquiry','제품 선정·견적 및 샘플 테스트','<div class="detail-cta"><div><p>검사 대상 또는 판독 코드, 설치 거리와 생산 속도를 알려주세요.</p></div>'+actions+'</div>',True)
 main='<main class="detail-page">'+breadcrumb+hero+body+'</main>'
 tokens={'TITLE':esc(title),'DESCRIPTION':esc(description),'CANONICAL':esc(url),'OG_IMAGE':esc(image),'JSON_LD':json.dumps(schemas,ensure_ascii=False),'MAIN_CONTENT':main}
 for key,val in tokens.items():template=template.replace('{{'+key+'}}',val)
 assert '{{' not in template
 return '<!-- GENERATED BY scripts/build-hikrobot-products.py -->\n'+template

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();changed=[]
 payload=json.loads((ROOT/'data/hikrobot-products.json').read_text());products=payload['products'];assert len(products)==13;assert len({p['slug'] for p in products})==13
 template=(ROOT/'templates/hikrobot-product-template.html').read_text()
 for p in products:
  assert (ROOT/p['image']).is_file()
  write(ROOT/('products/hikrobot/'+p['slug']+'.html'),render(p,products,payload['sourceCatalog'],template),args.check,changed)
 filters=''.join(f'<button class="product-filter" type="button" data-filter="{key}" aria-pressed="false">{name}</button>' for key,name in CATEGORIES.items())
 library=f'''<!-- HIKROBOT_PRODUCTS:START -->
        <section class="product-hub-section hikrobot-product-library" data-product-library aria-labelledby="hikrobot-products-heading">
            <div class="section-inner"><p class="section-kicker">Hikrobot Product Library</p><h2 id="hikrobot-products-heading" class="section-heading">Hikrobot 하이크로봇 제품</h2><p class="section-lead">비전센서와 AI 스마트카메라, 고정식·물류용·핸드형 바코드 리더기. 검사 방식과 설치 조건에 맞는 시리즈를 확인해 보세요.</p>
            <div class="product-toolbar"><div class="product-search-wrap"><label for="hikrobot-product-search" class="product-search-label">하이크로봇 제품 검색</label><input id="hikrobot-product-search" class="product-search" type="search" autocomplete="off" placeholder="시리즈 또는 모델 검색 (예: SC5000X, IDH3000)"></div><p class="product-count" aria-live="polite">13개 제품</p></div>
            <div class="product-filters" role="group" aria-label="Hikrobot 제품 카테고리"><button class="product-filter" type="button" data-filter="all" aria-pressed="true">전체</button>{filters}</div>
            <div class="product-grid">{''.join(card(p) for p in products)}</div><p class="product-empty">검색 조건에 맞는 제품이 없습니다. 시리즈명이나 모델명을 다시 확인해 주세요.</p><a href="hikrobot.html" class="hikrobot-hub-link">Hikrobot 머신비전·AI 시스템 구성 보기 <span aria-hidden="true">→</span></a></div>
        </section>
        <!-- HIKROBOT_PRODUCTS:END -->'''
 hub=(ROOT/'products.html').read_text()
 if '<!-- HIKROBOT_PRODUCTS:START -->' in hub:hub=re.sub(r'<!-- HIKROBOT_PRODUCTS:START -->.*?<!-- HIKROBOT_PRODUCTS:END -->',library,hub,flags=re.S)
 else:hub=re.sub(r'<section class="hikrobot-hub".*?</section>',library,hub,flags=re.S)
 itemlist={'@context':'https://schema.org','@type':'ItemList','name':'HIKROBOT 하이크로봇 제품','numberOfItems':len(products),'itemListElement':[{'@type':'ListItem','position':i,'name':'HIKROBOT '+p['name'],'url':'https://www.aspec-tech.co.kr/products/hikrobot/'+p['slug']+'.html'} for i,p in enumerate(products,1)]}
 marker='<!-- HIKROBOT_SCHEMA:START --><script type="application/ld+json">'+json.dumps(itemlist,ensure_ascii=False)+'</script><!-- HIKROBOT_SCHEMA:END -->'
 if '<!-- HIKROBOT_SCHEMA:START -->' in hub:hub=re.sub(r'<!-- HIKROBOT_SCHEMA:START -->.*?<!-- HIKROBOT_SCHEMA:END -->',marker,hub,flags=re.S)
 else:hub=hub.replace('</head>',marker+'\n</head>')
 write(ROOT/'products.html',hub,args.check,changed)
 sitemap=(ROOT/'sitemap.xml').read_text();urls='\n'.join('<url><loc>https://www.aspec-tech.co.kr/products/hikrobot/'+p['slug']+'.html</loc><lastmod>2026-10-18</lastmod><priority>0.8</priority></url>' for p in products);block='<!-- HIKROBOT_PRODUCTS:START -->\n'+urls+'\n<!-- HIKROBOT_PRODUCTS:END -->'
 if '<!-- HIKROBOT_PRODUCTS:START -->' in sitemap:sitemap=re.sub(r'<!-- HIKROBOT_PRODUCTS:START -->.*?<!-- HIKROBOT_PRODUCTS:END -->',block,sitemap,flags=re.S)
 else:sitemap=sitemap.replace('</urlset>',block+'\n</urlset>')
 write(ROOT/'sitemap.xml',sitemap,args.check,changed)
 print('HIKROBOT: 13 products; '+('would change: ' if args.check else 'changed: ')+(', '.join(changed) if changed else 'none'))
 return bool(changed) if args.check else 0
if __name__=='__main__':raise SystemExit(main())
