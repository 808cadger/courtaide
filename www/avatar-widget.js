(function () {
  'use strict';

  function getApiKey() {
    if (window.SWAvatarApiKey) return window.SWAvatarApiKey;
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        var v = localStorage.getItem(keys[i]);
        if (v && v.startsWith('sk-ant-')) return v;
      }
    } catch (e) {}
    return '';
  }

  function getCtx() {
    var el = document.getElementById('sw-avatar');
    if (el && el.dataset.context) return el.dataset.context;
    var m = document.querySelector('meta[name="description"]');
    return m ? m.content : '';
  }

  function getAppName() {
    var el = document.querySelector('meta[name="application-name"]');
    return el ? el.content : (document.title || 'CourtAide');
  }

  function getOptions() {
    return [
      'Explain this motion',
      'Check filing deadlines',
      'What forms do I need?',
      'How should I prepare?'
    ];
  }

  var GREETS = [
    'Need help sorting out a filing, deadline, or next step?',
    'Ask a court process question and I will keep it concise.',
    'I can help you decode motions, forms, and timing.',
    'Tell me what stage your case is in and I will orient you.'
  ];
  var greetIndex = -1;
  function nextGreet() {
    var n;
    do { n = Math.floor(Math.random() * GREETS.length); } while (n === greetIndex);
    greetIndex = n;
    return GREETS[n];
  }

  var CSS = [
    '.jd{position:fixed;bottom:22px;right:18px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '.jd-bubble{background:#0d1728;border:1px solid rgba(201,168,76,0.34);border-radius:18px 18px 6px 18px;color:#eef2ff;font-size:12px;line-height:1.55;max-width:248px;padding:11px 14px;word-break:break-word;box-shadow:0 10px 28px rgba(0,0,0,0.32);animation:jdPop .22s cubic-bezier(.34,1.56,.64,1)}',
    '.jd-bubble.hidden{display:none}',
    '.jd-bubble.error{border-color:rgba(239,68,68,0.55);color:#ffd7d7}',
    '.jd-opts{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;max-width:268px;animation:jdFade .2s ease}',
    '.jd-opts.hidden{display:none}',
    '.jd-opt{background:#10203a;border:1px solid rgba(147,184,220,0.28);border-radius:20px;color:#d8e7f7;font-size:10px;padding:6px 11px;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,transform .15s;user-select:none}',
    '.jd-opt:hover{background:rgba(27,79,138,0.34);border-color:rgba(201,168,76,0.42)}',
    '.jd-opt:active{transform:scale(.95)}',
    '.jd-row{display:flex;align-items:center;gap:7px;background:#0d1728;border:1px solid rgba(147,184,220,0.24);border-radius:24px;padding:6px 6px 6px 13px;width:240px;box-shadow:0 8px 22px rgba(0,0,0,0.28);animation:jdFade .2s ease}',
    '.jd-row.hidden{display:none}',
    '.jd-inp{flex:1;background:transparent;border:none;outline:none;color:#eef2ff;font-size:11px;caret-color:#c9a84c;min-width:0}',
    '.jd-inp::placeholder{color:rgba(238,242,255,0.36)}',
    '.jd-send{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1b4f8a,#c9a84c);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s,opacity .15s}',
    '.jd-send:active{transform:scale(.88)}',
    '.jd-send:disabled{opacity:.45;cursor:not-allowed}',
    '.jd-icon{width:54px;height:54px;border-radius:50%;background:linear-gradient(180deg,#10203a,#0d1728);border:1.5px solid rgba(201,168,76,0.42);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,0.03),0 14px 32px rgba(0,0,0,0.34);transition:box-shadow .2s,transform .2s;flex-shrink:0;animation:jdBob 3s ease-in-out infinite}',
    '.jd-icon:hover{box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 18px 38px rgba(0,0,0,0.42)}',
    '.jd-icon:active{transform:scale(.92)}',
    '.jd-icon.open{animation:none;box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 18px 40px rgba(0,0,0,0.44)}',
    '.jd-dots{display:inline-flex;gap:3px;align-items:center;padding:2px 0}',
    '.jd-dots span{width:5px;height:5px;border-radius:50%;background:#c9a84c;animation:jdBounce 1s ease-in-out infinite}',
    '.jd-dots span:nth-child(2){animation-delay:.15s}',
    '.jd-dots span:nth-child(3){animation-delay:.3s}',
    '@keyframes jdPop{0%{opacity:0;transform:scale(.86) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
    '@keyframes jdFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes jdBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',
    '@keyframes jdBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}'
  ].join('');

  var ICON_SVG = '<svg width="28" height="32" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M32 6L50 12V29C50 42.5 42.2 54.1 32 60C21.8 54.1 14 42.5 14 29V12L32 6Z" fill="url(#shield)"/>'
    + '<path d="M32 16V42" stroke="white" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M21 23H43" stroke="white" stroke-width="4" stroke-linecap="round"/>'
    + '<circle cx="32" cy="49" r="3.5" fill="#F6E7B0"/>'
    + '<defs><linearGradient id="shield" x1="14" y1="8" x2="53" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#1B4F8A"/><stop offset="1" stop-color="#C9A84C"/></linearGradient></defs></svg>';

  var DEMO = [
    'Demo mode is active. Add your Claude API key in Settings to get real legal guidance.',
    'No API key detected. Save your Claude key in Settings and I can answer for real.',
    'I can explain process and filings once your Claude API key is added in Settings.'
  ];
  var demoIndex = -1;
  function demoAnswer() {
    var n;
    do { n = Math.floor(Math.random() * DEMO.length); } while (n === demoIndex);
    demoIndex = n;
    return DEMO[n];
  }

  function friendlyError(status, msg) {
    if (status === 401) return 'Invalid API key. Update it in Settings.';
    if (status === 429) return 'Too many requests right now. Wait a moment and try again.';
    if (status === 529) return 'Claude is overloaded right now. Try again shortly.';
    if (status >= 500) return 'The AI service is having trouble. Try again in a moment.';
    if (msg && msg.indexOf('timeout') !== -1) return 'The request timed out. Check your connection and retry.';
    if (msg && msg.indexOf('network') !== -1) return 'Connection error. Check your network and retry.';
    return 'Something went wrong. Please try again.';
  }

  async function askStream(question, onChunk, onDone, onError) {
    var apiKey = getApiKey();
    if (!apiKey) {
      onDone(demoAnswer());
      return;
    }

    if (question.length > 500) question = question.slice(0, 500);

    var sys = 'You are a concise legal process assistant inside ' + getAppName() + '. Context: ' + (getCtx() || 'legal process guidance')
      + '. Answer in 2-3 short sentences. Do not claim to be a lawyer. Focus on filings, deadlines, forms, or next steps.';

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);

    try {
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 220,
          stream: true,
          system: sys,
          messages: [{ role: 'user', content: question }]
        })
      });

      clearTimeout(timer);

      if (!res.ok) {
        onError(friendlyError(res.status, ''));
        return;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var full = '';
      var buf = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buf += decoder.decode(result.value, { stream: true });
        var lines = buf.split('\n');
        buf = lines.pop();
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (!line.startsWith('data: ')) continue;
          var data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            var parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.type === 'text_delta') {
              full += parsed.delta.text;
              onChunk(full);
            }
          } catch (e) {}
        }
      }

      onDone(full || 'No answer returned.');
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        onError(friendlyError(0, 'timeout'));
        return;
      }
      onError(friendlyError(0, 'network'));
    }
  }

  function build() {
    var root = document.getElementById('sw-avatar');
    if (!root || document.getElementById('jd-css')) return;

    var s = document.createElement('style');
    s.id = 'jd-css';
    s.textContent = CSS;
    document.head.appendChild(s);

    var wrap = document.createElement('div');
    wrap.className = 'jd';

    var bubble = document.createElement('div');
    bubble.className = 'jd-bubble hidden';
    var bubText = document.createElement('span');
    bubble.appendChild(bubText);
    bubble.onclick = function () {
      bubble.classList.add('hidden');
      bubble.classList.remove('error');
    };

    var opts = document.createElement('div');
    opts.className = 'jd-opts hidden';
    getOptions().forEach(function (label) {
      var chip = document.createElement('button');
      chip.className = 'jd-opt';
      chip.textContent = label;
      chip.onclick = function () { submit(label); };
      opts.appendChild(chip);
    });

    var row = document.createElement('div');
    row.className = 'jd-row hidden';
    var inp = document.createElement('input');
    inp.className = 'jd-inp';
    inp.type = 'text';
    inp.placeholder = 'Ask CourtAide...';
    var send = document.createElement('button');
    send.className = 'jd-send';
    send.textContent = '↑';
    row.appendChild(inp);
    row.appendChild(send);

    var icon = document.createElement('div');
    icon.className = 'jd-icon';
    icon.innerHTML = ICON_SVG;

    wrap.appendChild(bubble);
    wrap.appendChild(opts);
    wrap.appendChild(row);
    wrap.appendChild(icon);
    root.appendChild(wrap);

    var isOpen = false;
    icon.onclick = function () {
      isOpen = !isOpen;
      icon.classList.toggle('open', isOpen);
      opts.classList.toggle('hidden', !isOpen);
      row.classList.toggle('hidden', !isOpen);
      if (isOpen && bubble.classList.contains('hidden')) {
        bubble.classList.remove('hidden');
        bubble.classList.remove('error');
        bubText.textContent = nextGreet();
      }
      if (isOpen) inp.focus();
    };

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit(inp.value);
      }
    });
    send.onclick = function () { submit(inp.value); };

    function submit(text) {
      text = (text || '').trim();
      if (!text) return;
      inp.value = '';
      bubble.classList.remove('hidden');
      bubble.classList.remove('error');
      bubText.innerHTML = '<span class="jd-dots"><span></span><span></span><span></span></span>';
      send.disabled = true;

      askStream(text, function (partial) {
        bubText.textContent = partial;
      }, function (finalText) {
        bubText.textContent = finalText;
        send.disabled = false;
      }, function (err) {
        bubble.classList.add('error');
        bubText.textContent = err;
        send.disabled = false;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  window.CourtAideWidget = { open: build };
})();
