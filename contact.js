/* Submit only once at a time; report a lead after the provider confirms acceptance. */
(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const submit = document.getElementById('contact-submit');
  const product = document.getElementById('inquiry-product');
  const type = document.getElementById('inquiry-type');
  const services = {
    ai: 'AI 비전검사 / 딥러닝 외관검사', ocr: 'OCR검사 / OCV검사',
    barcode: '바코드리더기 / QR코드 / DPM', software: 'PLC·MES 연동 검사 소프트웨어',
    optics: '머신비전 조명 / 머신비전 케이블 / 렌즈', hikrobot: 'AI 비전검사 / 딥러닝 외관검사'
  };
  const query = new URLSearchParams(window.location.search);
  const productId = query.get('product');
  if (Array.from(product.options).some(option => option.value && option.value === productId)) product.value = productId;
  const serviceId = query.get('service');
  if (Object.prototype.hasOwnProperty.call(services, serviceId)) type.value = services[serviceId];
  else if (product.value) type.value = '장비 상담 / 견적 문의';
  let sending = false;
  let submitted = false;
  form.addEventListener('input', () => { submitted = false; });
  form.addEventListener('change', () => { submitted = false; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || submitted || !form.reportValidity() || form.elements._honey.value) return;
    sending = true;
    status.className = 'text-sm leading-relaxed text-blue-300';
    status.textContent = '문의 내용을 전송하고 있습니다.';
    submit.disabled = true;
    submit.textContent = '전송 중...';
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const body = new FormData(form);
      // The recipient sees the model name; event parameters use only the controlled model ID.
      const selectedProduct = product.value;
      body.set('문의 제품', selectedProduct ? product.selectedOptions[0].textContent : '모델 미정 / 프로젝트 상담');
      const response = await fetch('https://formsubmit.co/ajax/sales@aspec-tech.co.kr', {
        method: 'POST', headers: {'Accept': 'application/json'}, body, signal: controller.signal
      });
      if (!response.ok) throw new Error('send failed');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('not accepted');
      const service = Object.keys(services).find(key => services[key] === type.value) || 'general';
      // Neither message nor email/phone/company details are sent to analytics.
      if (typeof window.aspecTrack === 'function') {
        window.aspecTrack('generate_lead', {lead_source: 'website_form', product_id: selectedProduct || 'unspecified', service_type: service});
      }
      form.reset();
      product.value = selectedProduct;
      submitted = true;
      status.className = 'text-sm leading-relaxed text-green-300';
      status.textContent = '문의가 접수되었습니다. 연락처를 남겨주셨다면 확인 후 답변드리겠습니다.';
    } catch (_) {
      status.className = 'text-sm leading-relaxed text-red-300';
      status.textContent = '전송을 확인하지 못했습니다. 잠시 후 다시 시도하거나 sales@aspec-tech.co.kr 또는 010-9679-5522로 문의해주세요.';
    } finally {
      window.clearTimeout(timer);
      sending = false;
      submit.disabled = false;
      submit.textContent = '문의 보내기';
    }
  });
})();
