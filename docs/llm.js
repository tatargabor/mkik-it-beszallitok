// LLM Chat - OpenAI API integration
(function () {
  const STORAGE_KEY = 'mkik_openai_key';
  const MODEL = 'gpt-4o-mini';

  // DOM refs
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const apiKeyInput = document.getElementById('api-key-input');
  const apiKeyDisplay = document.getElementById('api-key-display');
  const apiKeyMasked = document.getElementById('api-key-masked');
  const apiKeySave = document.getElementById('api-key-save');
  const apiKeyDelete = document.getElementById('api-key-delete');
  const settingsClose = document.getElementById('settings-close');
  const llmNoKey = document.getElementById('llm-no-key');
  const llmChat = document.getElementById('llm-chat');
  const llmInput = document.getElementById('llm-input');
  const llmSend = document.getElementById('llm-send');
  const llmResponse = document.getElementById('llm-response');

  function getKey() { return localStorage.getItem(STORAGE_KEY); }
  function setKey(k) { localStorage.setItem(STORAGE_KEY, k); }
  function removeKey() { localStorage.removeItem(STORAGE_KEY); }

  function maskKey(k) {
    if (!k || k.length < 8) return '***';
    return k.slice(0, 5) + '\u2022'.repeat(8);
  }

  function updateUI() {
    const key = getKey();
    if (key) {
      llmNoKey.classList.add('hidden');
      llmChat.classList.remove('hidden');
      apiKeyDisplay.classList.remove('hidden');
      apiKeyMasked.textContent = maskKey(key);
    } else {
      llmNoKey.classList.remove('hidden');
      llmChat.classList.add('hidden');
      apiKeyDisplay.classList.add('hidden');
      apiKeyMasked.textContent = '';
    }
  }

  // Settings modal
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    apiKeyInput.value = '';
  });

  settingsClose.addEventListener('click', () => settingsModal.classList.add('hidden'));

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.add('hidden');
  });

  apiKeySave.addEventListener('click', () => {
    const v = apiKeyInput.value.trim();
    if (v) {
      setKey(v);
      apiKeyInput.value = '';
      updateUI();
    }
  });

  apiKeyDelete.addEventListener('click', () => {
    removeKey();
    updateUI();
  });

  // Build context from filtered companies
  function buildContext(companies) {
    if (companies.length <= 50) {
      return JSON.stringify(companies.map(c => {
        const obj = { id: c.id, name: c.name };
        if (c.hq_city) obj.hq_city = c.hq_city;
        if (c.contact_name) obj.contact_name = c.contact_name;
        if (c.contact_email) obj.contact_email = c.contact_email;
        if (c.website) obj.website = c.website;
        if (c.intro) obj.intro = c.intro;
        if (c.counties) obj.counties = c.counties;
        if (c.softwares) obj.softwares = c.softwares;
        if (c.tenders) obj.tenders = c.tenders;
        return obj;
      }));
    }
    // Truncated version for large sets
    return JSON.stringify(companies.map(c => {
      const obj = { id: c.id, name: c.name };
      if (c.hq_city) obj.hq_city = c.hq_city;
      if (c.softwares) obj.sw = c.softwares.map(s => s.name + (s.type ? ` (${s.type})` : ''));
      return obj;
    })) + '\n\n[MEGJEGYZÉS: A lista rövidítve van mert több mint 50 cég van. Csak a nevek, városok és szoftver nevek láthatók.]';
  }

  // Send to OpenAI
  async function sendQuestion(question) {
    const key = getKey();
    if (!key) throw new Error('Nincs API kulcs beállítva.');

    const companies = window.getFilteredCompanies();
    if (!companies.length) throw new Error('Nincs szűrt cég. Módosítsd a szűrőket.');

    const context = buildContext(companies);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `Te egy MKIK "Vállalkozz Digitálisan" beszállító kereső asszisztens vagy. A felhasználó kérdéseire az alábbi cégadatok alapján válaszolj magyarul. Legyél tömör és informatív.\n\nJelenleg ${companies.length} cég van szűrve. Adatok:\n${context}`
          },
          { role: 'user', content: question }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API hiba: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Chat UI
  llmSend.addEventListener('click', handleSend);
  llmInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  async function handleSend() {
    const question = llmInput.value.trim();
    if (!question) return;

    llmSend.disabled = true;
    llmResponse.textContent = 'Gondolkodom...';
    llmResponse.className = 'llm-loading';

    try {
      const answer = await sendQuestion(question);
      llmResponse.textContent = answer;
      llmResponse.className = '';
    } catch (err) {
      llmResponse.textContent = err.message;
      llmResponse.className = 'llm-error';
    } finally {
      llmSend.disabled = false;
    }
  }

  // Init
  updateUI();
})();
