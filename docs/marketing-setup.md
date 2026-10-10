# ASPEC 검색·광고 운영 설정

2026-10-10 변경: 공개가격 없는 제품 소개 페이지의 불완전한 Product 마크업을 WebPage + BreadcrumbList로 교체했습니다. Product 리치 결과를 포기하는 대신 사실과 일치하는 견적 상담형 페이지로 운영합니다. 실제 공개가격·리뷰를 운영할 때만 해당 내용과 일치하는 Product 마크업을 다시 추가하세요. 가격 0원이나 임의 평점을 넣지 마세요.

## 배포 후 Search Console

1. `/products/cognex/dataman-290.html`을 URL 검사 → 실제 URL 테스트로 확인합니다.
2. [리치 결과 테스트](https://search.google.com/test/rich-results)에서 BreadcrumbList 오류가 없는지 확인합니다. Product 항목이 더 이상 검출되지 않는 것이 의도된 결과입니다.
3. 기존 오류 보고서의 **수정 결과 확인**을 누릅니다. 재크롤링·검증이 완료되기 전까지 이전 오류가 보일 수 있습니다.
4. 사이트맵 `https://www.aspec-tech.co.kr/sitemap.xml`을 확인하고 새 OCR 페이지의 색인 생성을 요청합니다.
5. 검색 실적을 페이지/검색어별로 비교합니다. 수정 직후 순위 상승을 보장할 수 없으며 노출·클릭·문의 추이를 봅니다.

## GA4 / Google Ads (계정 내 설정 필요)

기존 GA4 `G-J4CN1T8SXW`를 사용합니다. 새 광고 ID나 가짜 전환 라벨은 추가하지 않았습니다.

- `generate_lead`: FormSubmit이 성공을 반환한 문의 접수만 측정합니다. 이메일 실제 전달/영업 성사까지 보장하는 이벤트는 아닙니다.
- `inquiry_click`: 문의 페이지 이동 버튼 클릭. 문의 접수와 구분합니다.
- `contact_click`: 전화 또는 이메일 링크 클릭. 실제 통화 완료나 이메일 발송과 구분합니다.
- `generate_lead`의 매개변수: `lead_source`, `product_id`, `service_type`. 문의 내용·연락처·회사명은 이벤트로 보내지 않습니다. GA4 자동 향상된 측정의 양식 상호작용도 점검해 중복 전환을 피하세요.

1. 실제 문의 접수가 필요할 때 GA4 실시간/DebugView에서 `generate_lead`가 도착하는지 확인합니다. 개발 검증은 가짜 HTTP 응답으로 수행했으며 테스트 메일을 보내지 않았습니다.
2. GA4에서 `generate_lead`를 주요 이벤트로 지정합니다.
3. GA4와 Google Ads를 연결하고 `generate_lead`를 Google Ads의 문의 전환으로 가져옵니다. 이미 같은 전환이 있다면 중복 생성하지 마세요.
4. 문의 전환 집계는 보통 광고 상호작용당 **1회**로 설정합니다. 문의 버튼·전화 클릭은 보조 전환으로 검토합니다.
5. 제품별 분석이 필요하면 `product_id`와 `service_type`을 이벤트 범위 맞춤 측정기준으로 등록합니다.

## 광고그룹과 도착 페이지

아래는 검색량·입찰가를 확인한 결과가 아니라 ASPEC 서비스에 맞춘 구성안입니다. 실제 검색어 보고서와 문의 결과로 조정하세요.

| 광고그룹 | 검색어 예시 | 최종 URL |
|---|---|---|
| 머신비전 시스템 | 머신비전 업체, 비전검사 시스템 구축 | https://www.aspec-tech.co.kr/ |
| AI 외관검사 | AI 비전검사, 딥러닝 외관검사 | https://www.aspec-tech.co.kr/ai-vision.html |
| 문자검사 | 생산일자 OCR 검사, LOT 검사, OCV 검사 | https://www.aspec-tech.co.kr/ocr-inspection.html |
| 산업용 바코드 | 산업용 바코드 리더기, DPM 판독 | https://www.aspec-tech.co.kr/barcode-reader.html |
| DataMan 290 | DataMan 290 견적, 코그넥스 DataMan 290 | https://www.aspec-tech.co.kr/products/cognex/dataman-290.html |
| Hikrobot | 하이크로봇 스마트카메라, VisionMaster | https://www.aspec-tech.co.kr/hikrobot.html |
| 프로그램 개발 | VisionPro 개발, 머신비전 프로그램 개발 | https://www.aspec-tech.co.kr/vision-software.html |

연관 검색어를 제목/본문/실제 사례에 자연스럽게 사용하세요. meta keywords를 늘리는 작업은 Google 순위에 영향을 주지 않습니다. 광고의 표시 도메인과 최종 도메인은 일치시킵니다. 소비자용 QR 스캐너 앱처럼 사업과 다른 검색어는 검색어 보고서를 확인한 뒤 제외합니다. 구매 검토에 필요한 검색어까지 일괄 제외하지 마세요.

## 유지보수

- 구축사례는 `data/case-studies.json`과 `templates/`를 수정한 뒤 `python scripts/build-case-studies.py`로 생성합니다. 새 공통 메뉴·자산 연결은 템플릿에도 반영했습니다.
- 확인: `python scripts/build-case-studies.py --check` 및 `python scripts/check-site.py`.
- 새 제품 추가 시 제품 소개의 WebPage, 실제 이미지·설명, 문의 제품 선택 옵션, 상단·하단 문의 링크와 사이트맵을 함께 관리합니다.
- 모바일 메뉴는 HTML details 요소로 작동하므로 JavaScript가 없어도 링크를 탐색할 수 있습니다.
- 문의 전송 서비스 FormSubmit의 수신 주소 활성화 상태와 실제 수신 여부는 별도로 관리합니다.

공식 참고: [제품 스니펫](https://developers.google.com/search/docs/appearance/structured-data/product-snippet?hl=ko), [Google이 지원하는 메타 태그](https://developers.google.com/search/docs/crawling-indexing/special-tags), [GA4 권장 이벤트](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
