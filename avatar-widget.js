(function () {

  /* ── API key discovery ─────────────────────────────────────────── */
  function getApiKey() {
    // 1. App can set window.SWAvatarApiKey before loading this script
    if (window.SWAvatarApiKey) return window.SWAvatarApiKey;
    // 2. Scan localStorage for any key starting with sk-ant-
    try {
      var lsKeys = Object.keys(localStorage);
      for (var i = 0; i < lsKeys.length; i++) {
        var val = localStorage.getItem(lsKeys[i]);
        if (val && val.startsWith('sk-ant-')) return val;
      }
    } catch (e) {}
    return '';
  }

  function saveApiKey(key) {
    try { localStorage.setItem('avatar_api_key', key); } catch (e) {}
  }

  /* ── App context ───────────────────────────────────────────────── */
  function getAppContext() {
    var el = document.getElementById('sw-avatar');
    if (el && el.dataset.context) return el.dataset.context;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) return meta.content;
    return '';
  }

  function getAppName() {
    var el = document.querySelector('meta[name="application-name"]');
    if (el) return el.content;
    try {
      var link = document.querySelector('link[rel="manifest"]');
      if (!link) return document.title || 'this app';
    } catch (e) {}
    return document.title || 'this app';
  }

  /* ── Star Wars greetings (shown before any question) ───────────── */
  var LINES = [
    'Hello! How can I help you today?',
    'Ask me anything — the Force is with us.',
    'Ready to assist, young Padawan.',
    'What do you need to know?',
    'Your question is my mission.',
    'Speak, and I shall answer.',
    'The Force is strong — ask away.',
    'Patience yields knowledge. Ask me!',
  ];
  var idx = -1;
  function nextLine() {
    var n; do { n = Math.floor(Math.random() * LINES.length); } while (n === idx);
    idx = n; return LINES[n];
  }

  /* ── CSS ───────────────────────────────────────────────────────── */
  var CSS = [
    '.swa{position:fixed;bottom:20px;right:16px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:sans-serif}',
    '.swa-bubble{background:#0a0e1a;border:1px solid #4fc3f7;border-radius:12px 12px 3px 12px;color:#e3f2fd;font-size:9px;line-height:1.4;max-width:200px;padding:8px 10px;word-break:break-word;position:relative}',
    '.swa-bubble:after{content:"";position:absolute;bottom:-8px;right:14px;border:4px solid transparent;border-top-color:#4fc3f7}',
    '.swa-msg{display:block;margin-bottom:6px;min-height:10px}',
    '.swa-bar{display:flex;align-items:center;gap:4px;background:rgba(79,195,247,0.1);border:1px solid rgba(79,195,247,0.35);border-radius:20px;padding:3px 7px}',
    '.swa-bar input{flex:1;background:transparent;border:none;outline:none;color:#e3f2fd;font-size:9px;min-width:0;caret-color:#4fc3f7}',
    '.swa-bar input::placeholder{color:rgba(179,229,252,0.4)}',
    '.swa-go{background:none;border:none;color:#4fc3f7;font-size:11px;cursor:pointer;padding:0;line-height:1}',
    '.swa-apirow{display:flex;align-items:center;gap:4px;margin-top:5px}',
    '.swa-apirow input{flex:1;background:transparent;border:none;border-bottom:1px solid rgba(79,195,247,0.4);outline:none;color:#e3f2fd;font-size:8px;min-width:0;padding:2px 0}',
    '.swa-apirow input::placeholder{color:rgba(179,229,252,0.3)}',
    '.swa-apisave{background:none;border:none;color:#4fc3f7;font-size:9px;cursor:pointer;white-space:nowrap}',
    '.swa-droid{width:60px;height:60px;cursor:pointer;filter:drop-shadow(0 0 8px rgba(79,195,247,0.5))}',
    '@keyframes swa-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
    '@keyframes swa-glow{0%,100%{opacity:1}50%{opacity:0.3}}',
    '@keyframes swa-blink{0%,88%,100%{opacity:1}94%{opacity:0}}',
    '.swa-droid{animation:swa-bob 3s ease-in-out infinite}',
    '.swa-eye{animation:swa-glow 2s ease-in-out infinite}',
    '.swa-ant{animation:swa-blink 2s ease-in-out infinite}',
    '.swa-thinking{opacity:0.5;font-style:italic}',
  ].join('');

  /* ── SVG droid ─────────────────────────────────────────────────── */
  var SVG = '<svg width="60" height="74" viewBox="0 0 60 74" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<rect x="16" y="52" width="7" height="16" rx="3" fill="#90a4ae"/>'
    + '<rect x="37" y="52" width="7" height="16" rx="3" fill="#90a4ae"/>'
    + '<rect x="13" y="64" width="12" height="4" rx="2" fill="#607d8b"/>'
    + '<rect x="35" y="64" width="12" height="4" rx="2" fill="#607d8b"/>'
    + '<rect x="12" y="28" width="36" height="28" rx="7" fill="#1a237e"/>'
    + '<rect x="12" y="28" width="36" height="28" rx="7" fill="url(#bg)"/>'
    + '<line x1="19" y1="34" x2="19" y2="50" stroke="#4fc3f7" stroke-width="0.7" opacity="0.5"/>'
    + '<line x1="41" y1="34" x2="41" y2="50" stroke="#4fc3f7" stroke-width="0.7" opacity="0.5"/>'
    + '<circle cx="30" cy="42" r="4" fill="#4fc3f7" opacity="0.9"/>'
    + '<circle cx="30" cy="42" r="2.5" fill="#e3f2fd"/>'
    + '<path d="M12 26 Q12 8 30 8 Q48 8 48 26 Z" fill="#1565c0"/>'
    + '<path d="M12 26 Q12 8 30 8 Q48 8 48 26 Z" fill="url(#dg)"/>'
    + '<path d="M14 20 Q30 15 46 20" stroke="#4fc3f7" stroke-width="1.2" fill="none" opacity="0.5"/>'
    + '<circle cx="30" cy="18" r="6" fill="#0d1b2a"/>'
    + '<circle class="swa-eye" cx="30" cy="18" r="4" fill="#4fc3f7"/>'
    + '<circle cx="30" cy="18" r="2.5" fill="#e3f2fd"/>'
    + '<circle cx="28.5" cy="16.5" r="0.8" fill="white" opacity="0.8"/>'
    + '<circle cx="17" cy="18" r="2" fill="#37474f"/><circle cx="17" cy="18" r="1.2" fill="#4fc3f7" opacity="0.7"/>'
    + '<circle cx="43" cy="18" r="2" fill="#37474f"/><circle cx="43" cy="18" r="1.2" fill="#4fc3f7" opacity="0.7"/>'
    + '<line x1="30" y1="8" x2="30" y2="3" stroke="#78909c" stroke-width="1.5"/>'
    + '<circle class="swa-ant" cx="30" cy="2" r="2" fill="#f44336"/>'
    + '<rect x="6" y="32" width="6" height="16" rx="3" fill="#263238"/>'
    + '<rect x="4" y="43" width="9" height="4" rx="2" fill="#37474f"/>'
    + '<rect x="48" y="32" width="6" height="16" rx="3" fill="#263238"/>'
    + '<rect x="47" y="43" width="9" height="4" rx="2" fill="#37474f"/>'
    + '<defs>'
    + '<linearGradient id="bg" x1="12" y1="28" x2="48" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1565c0" stop-opacity="0.8"/><stop offset="100%" stop-color="#0d1b2a"/></linearGradient>'
    + '<linearGradient id="dg" x1="12" y1="8" x2="48" y2="26" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#42a5f5" stop-opacity="0.25"/><stop offset="100%" stop-color="#1565c0" stop-opacity="0"/></linearGradient>'
    + '</defs></svg>';

  /* ── Typewriter ─────────────────────────────────────────────────── */
  var charTimer = null;
  var greetTimer = null;

  function typeText(el, text, done) {
    clearInterval(charTimer);
    el.textContent = '';
    el.classList.remove('swa-thinking');
    var i = 0;
    charTimer = setInterval(function () {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(charTimer); if (done) done(); }
    }, 22);
  }

  /* ── Claude API call ────────────────────────────────────────────── */
  function askClaude(question, apiKey, callback) {
    var appName    = getAppName();
    var appContext = getAppContext();
    var systemMsg  = 'You are a helpful AI assistant built into ' + appName + '.'
      + (appContext ? ' The app is: ' + appContext + '.' : '')
      + ' Answer concisely in 2-3 sentences. Be friendly and direct.';

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemMsg,
        messages: [{ role: 'user', content: question }]
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.error) { callback(null, data.error.message); return; }
      callback(data.content && data.content[0] && data.content[0].text || 'No answer.', null);
    })
    .catch(function (err) { callback(null, err.message); });
  }

  /* ── Build widget ───────────────────────────────────────────────── */
  function build() {
    var root = document.getElementById('sw-avatar');
    if (!root) return;

    if (!document.getElementById('swa-css')) {
      var s = document.createElement('style');
      s.id = 'swa-css'; s.textContent = CSS;
      document.head.appendChild(s);
    }

    var wrap   = document.createElement('div');   wrap.className = 'swa';
    var bubble = document.createElement('div');   bubble.className = 'swa-bubble';
    var msg    = document.createElement('span');  msg.className = 'swa-msg';

    /* search bar */
    var bar = document.createElement('div');      bar.className = 'swa-bar';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Ask me anything…';
    var go  = document.createElement('button');   go.className = 'swa-go'; go.textContent = '›';
    bar.appendChild(inp); bar.appendChild(go);

    /* api key row (shown only if no key found) */
    var apiRow  = document.createElement('div');  apiRow.className = 'swa-apirow';
    var apiInp  = document.createElement('input');
    apiInp.type = 'text'; apiInp.placeholder = 'Paste Claude API key…';
    var apiSave = document.createElement('button'); apiSave.className = 'swa-apisave'; apiSave.textContent = 'Save';
    apiRow.appendChild(apiInp); apiRow.appendChild(apiSave);
    apiRow.style.display = 'none';

    bubble.appendChild(msg);
    bubble.appendChild(bar);
    bubble.appendChild(apiRow);

    /* droid */
    var droid = document.createElement('div');    droid.className = 'swa-droid';
    droid.innerHTML = SVG;

    wrap.appendChild(bubble);
    wrap.appendChild(droid);
    root.appendChild(wrap);

    /* show/hide API key row based on whether we have a key */
    function refreshApiRow() {
      apiRow.style.display = getApiKey() ? 'none' : 'flex';
    }
    refreshApiRow();

    /* save API key */
    apiSave.onclick = function () {
      var k = apiInp.value.trim();
      if (k) { saveApiKey(k); apiRow.style.display = 'none'; }
    };

    /* submit question */
    function submit() {
      var question = inp.value.trim();
      if (!question) return;
      inp.value = '';

      var apiKey = getApiKey();
      if (!apiKey) {
        typeText(msg, 'Please add your Claude API key below ↓');
        apiRow.style.display = 'flex';
        return;
      }

      clearTimeout(greetTimer);
      msg.classList.add('swa-thinking');
      msg.textContent = 'Thinking…';

      askClaude(question, apiKey, function (answer, err) {
        if (err) {
          typeText(msg, 'Error: ' + err);
        } else {
          typeText(msg, answer, function () {
            // After 12 s go back to a greeting
            greetTimer = setTimeout(showGreeting, 12000);
          });
        }
      });
    }

    go.onclick = submit;
    inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };

    /* droid tap → new greeting */
    droid.onclick = function () { inp.value = ''; showGreeting(); };

    function showGreeting() {
      clearTimeout(greetTimer);
      typeText(msg, nextLine(), function () {
        greetTimer = setTimeout(showGreeting, 10000);
      });
    }

    setTimeout(showGreeting, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  window.SWAvatar = { askClaude: askClaude };

})();
