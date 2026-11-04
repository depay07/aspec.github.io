/* Keep the inquiry in the browser until FormSubmit confirms acceptance. */
(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const endpoint = 'https://formsubmit.co/ajax/sales@aspec-tech.co.kr';
  const salesEmail = 'sales@aspec-tech.co.kr';
  const status = document.getElementById('contact-status');
  const submit = document.getElementById('contact-submit');
  const type = document.getElementById('inquiry-type');
  const message = document.getElementById('inquiry-message');
  const contact = document.getElementById('inquiry-contact');
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
  let submitted = false;

  function setStatus(text, tone = 'blue') {
    status.className = `text-sm leading-relaxed text-${tone}-300`;
    status.textContent = text;
  }

  function inquiryText() {
    return [
      `문의 유형: ${type.value || '간단 문의'}`,
      `답변 받을 연락처: ${contact.value.trim() || '미입력'}`,
      '',
      message.value.trim()
    ].join('\n');
  }

  function mailtoUrl() {
    const subject = `[ASPEC 홈페이지 문의] ${type.value || '간단 문의'}`;
    return `mailto:${salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryText())}`;
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('copy failed');
  }

  function removeFallback() {
    document.getElementById('contact-fallback')?.remove();
  }

  function fallbackButton(label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = 'px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors';
    button.addEventListener('click', handler);
    return button;
  }

  function showFallback() {
    removeFallback();
    const panel = document.createElement('div');
    panel.id = 'contact-fallback';
    panel.className = 'space-y-3';

    const help = document.createElement('p');
    help.className = 'text-sm leading-relaxed text-gray-300';
    help.textContent = '작성하신 내용은 이 화면에 그대로 남아 있습니다. 아래 방법으로 바로 보내실 수 있습니다.';

    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap gap-3';

    const emailLink = document.createElement('a');
    emailLink.href = mailtoUrl();
    emailLink.textContent = '메일 앱으로 보내기';
    emailLink.className = 'inline-flex items-center px-4 py-3 rounded-lg bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors';
    emailLink.addEventListener('click', () => { emailLink.href = mailtoUrl(); });

    const copyEmail = fallbackButton('이메일 주소 복사', async () => {
      try {
        await copyText(salesEmail);
        setStatus('이메일 주소를 복사했습니다.', 'green');
      } catch (_) {
        setStatus(`복사하지 못했습니다. 이메일 주소는 ${salesEmail}입니다.`, 'red');
      }
    });

    const copyInquiry = fallbackButton('문의 내용 복사', async () => {
      try {
        await copyText(inquiryText());
        setStatus('문의 내용을 복사했습니다.', 'green');
      } catch (_) {
        setStatus('자동 복사가 되지 않았습니다. 입력한 내용을 직접 선택해 복사해주세요.', 'red');
      }
    });

    actions.append(emailLink, copyEmail, copyInquiry);
    panel.append(help, actions);
    status.insertAdjacentElement('afterend', panel);
  }

  function activationRequired(result) {
    if (result?.success === true || result?.success === 'true') return false;
    const detail = JSON.stringify(result || {}).toLowerCase();
    return detail.includes('activate') || detail.includes('activation') || detail.includes('confirm');
  }

  async function sendOnce(timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (activationRequired(result)) {
        const error = new Error('activation required');
        error.activationRequired = true;
        throw error;
      }
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error('not accepted');
      }
      return result;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  form.addEventListener('input', () => { submitted = false; });
  form.addEventListener('change', () => { submitted = false; });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || submitted || !form.reportValidity() || form.elements._honey.value) return;

    sending = true;
    removeFallback();
    setStatus('문의 내용을 전송하고 있습니다.');
    submit.disabled = true;
    submit.textContent = '전송 중...';

    try {
      try {
        await sendOnce();
      } catch (firstError) {
        if (firstError.activationRequired) throw firstError;
        setStatus('전송 응답이 늦어 한 번 더 확인하고 있습니다.');
        await wait(1200);
        await sendOnce();
      }

      const service = Object.keys(services).find(key => services[key] === type.value) || 'general';
      if (typeof window.aspecTrack === 'function') {
        window.aspecTrack('generate_lead', { lead_source: 'website_form', service_type: service });
      }
      form.reset();
      submitted = true;
      setStatus('문의가 접수되었습니다. 연락처를 남겨주셨다면 확인 후 답변드리겠습니다.', 'green');
    } catch (error) {
      if (error.activationRequired) {
        setStatus('수신 이메일 승인이 필요합니다. sales@aspec-tech.co.kr 받은편지함과 스팸함에서 FormSubmit 승인 메일을 확인해주세요.', 'red');
      } else {
        setStatus('자동 전송을 확인하지 못했습니다. 아래 방법으로 작성한 내용을 바로 보내주세요.', 'red');
      }
      showFallback();
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = '문의 보내기';
    }
  });
})();

