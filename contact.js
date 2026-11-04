/* Store every accepted inquiry in ASPEC ERP before reporting success. */
(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const endpoint = 'https://gqttpmdpqotrkbdbstuu.supabase.co/functions/v1/website-inquiry';
  const draftKey = 'aspec-contact-draft-v1';
  const status = document.getElementById('contact-status');
  const submit = document.getElementById('contact-submit');
  const type = document.getElementById('inquiry-type');
  const message = document.getElementById('inquiry-message');
  const contact = document.getElementById('inquiry-contact');
  const honey = form.elements._honey;
  const services = {
    ai: 'AI 비전검사 / 딥러닝 외관검사',
    ocr: 'OCR검사 / OCV검사',
    barcode: '바코드리더기 / QR코드 / DPM',
    software: 'PLC·MES 연동 검사 소프트웨어',
    optics: '머신비전 조명 / 머신비전 케이블 / 렌즈',
    hikrobot: 'AI 비전검사 / 딥러닝 외관검사'
  };

  const query = new URLSearchParams(window.location.search);
  const serviceId = query.get('service');
  if (Object.prototype.hasOwnProperty.call(services, serviceId)) type.value = services[serviceId];

  let sending = false;
  let requestId = null;

  function setStatus(text, tone = 'blue') {
    status.className = `text-sm leading-relaxed text-${tone}-300`;
    status.textContent = text;
  }

  function createRequestId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const value = Math.random() * 16 | 0;
      return (char === 'x' ? value : (value & 3 | 8)).toString(16);
    });
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        inquiry_type: type.value,
        message: message.value,
        contact: contact.value
      }));
    } catch (_) {}
  }

  function restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (!draft) return;
      if (!serviceId && draft.inquiry_type) type.value = draft.inquiry_type;
      if (draft.message) message.value = draft.message;
      if (draft.contact) contact.value = draft.contact;
    } catch (_) {}
  }

  async function send(payload, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        const error = new Error(result.error || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return result;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  restoreDraft();
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity() || honey.value) return;

    sending = true;
    requestId = requestId || createRequestId();
    saveDraft();
    setStatus('문의 내용을 안전하게 접수하고 있습니다.');
    submit.disabled = true;
    submit.textContent = '접수 중...';

    const payload = {
      request_id: requestId,
      inquiry_type: type.value || '간단 문의',
      message: message.value.trim(),
      contact: contact.value.trim(),
      source_page: window.location.href.slice(0, 500),
      website: honey.value
    };

    try {
      let result;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          result = await send(payload);
          break;
        } catch (error) {
          if (error.status === 429 || attempt === 2) throw error;
          setStatus('접수 서버 응답을 다시 확인하고 있습니다. 잠시만 기다려주세요.');
          await wait(900 * (attempt + 1));
        }
      }
      if (!result || !result.id) throw new Error('missing receipt id');

      const service = Object.keys(services).find(key => services[key] === type.value) || 'general';
      if (typeof window.aspecTrack === 'function') {
        window.aspecTrack('generate_lead', {lead_source: 'website_form', service_type: service});
      }

      form.reset();
      requestId = null;
      try { localStorage.removeItem(draftKey); } catch (_) {}
      setStatus(`문의가 접수되었습니다. 접수번호 ${result.id.slice(0, 8).toUpperCase()}`, 'green');
    } catch (error) {
      console.error('Inquiry submission failed:', error);
      if (error.status === 429) {
        setStatus('짧은 시간에 여러 문의가 접수되어 잠시 제한되었습니다. 잠시 후 다시 눌러주세요.', 'red');
      } else {
        setStatus('접수 서버 연결을 확인하지 못했습니다. 입력 내용은 이 브라우저에 보관되어 있으니 잠시 후 문의 보내기를 다시 눌러주세요.', 'red');
      }
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = '문의 보내기';
    }
  });
})();

