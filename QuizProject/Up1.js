// ✅ Udemy AI Bookmarklet Tool – FIXED: Independent Buttons
// Project Suggestion & Quiz buttons now work independently & repeatedly
// Bookmarklet:
// javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Shantnu-Talokar/Mama-Developer/script.js?t='+Date.now();document.body.appendChild(s);})();

(function () {
  if (document.getElementById('udemyAnalyzerBtn')) return;
  if (!location.hostname.includes('udemy.com')) return alert('⚠️ Open this on a Udemy course page.');

  const btn = document.createElement('button');
  btn.id = 'udemyAnalyzerBtn';
  btn.textContent = '📘';
  btn.style.cssText =
    'position:fixed;bottom:20px;right:20px;background:#4CAF50;color:white;border:none;border-radius:50%;' +
    'width:60px;height:60px;font-size:28px;font-weight:bold;cursor:move;z-index:9999;box-shadow:0 4px 10px rgba(0,0,0,0.3);';

  const panel = document.createElement('div');
  panel.id = 'udemyAnalysisPanel';
  panel.style.cssText =
    'display:none;position:fixed;bottom:90px;right:20px;width:350px;height:600px;padding:15px;background:white;color:black;' +
    'border:1px solid #ccc;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.3);overflow:auto;z-index:9999;' +
    'font-family:sans-serif;font-size:14px;line-height:1.4;white-space:pre-wrap;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '❌';
  closeBtn.style.cssText =
    'position:absolute;top:8px;right:10px;background:none;border:none;font-size:16px;cursor:pointer;';
  closeBtn.onclick = () => (panel.style.display = 'none');
  panel.appendChild(closeBtn);
  document.body.appendChild(panel);

  let moved = false;
  btn.onmousedown = e => {
    moved = false;
    e.preventDefault();
    const sx = e.clientX - btn.getBoundingClientRect().left;
    const sy = e.clientY - btn.getBoundingClientRect().top;
    function mm(e) {
      moved = true;
      btn.style.left = e.pageX - sx + 'px';
      btn.style.top = e.pageY - sy + 'px';
      btn.style.bottom = 'auto';
      btn.style.right = 'auto';
      panel.style.left = parseInt(btn.style.left) + 'px';
      panel.style.top = parseInt(btn.style.top) - 630 + 'px';
    }
    document.addEventListener('mousemove', mm);
    btn.onmouseup = () => {
      document.removeEventListener('mousemove', mm);
      btn.onmouseup = null;
    };
  };
  btn.ondragstart = () => false;

  btn.onclick = async () => {
    if (moved) return;
    moved = false;

    const url = location.href;
    const title = document.querySelector('h1')?.innerText || 'Untitled Course';
    const apiKey = 'zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q';
    const endpoint = 'https://api.cohere.ai/v1/generate';
    const cohereQuery = async (p, max = 400) => {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'command-r-plus', prompt: p, max_tokens: max, temperature: 0.7 })
      });
      const d = await r.json();
      return d.generations?.[0]?.text || '⚠️ No response';
    };

    panel.style.display = 'block';
    panel.innerHTML = '<b>⏳ Analyzing course…</b>';
    panel.appendChild(closeBtn);

    try {
      const analysisPrompt =
        `You are an educational analyst. Analyze this Udemy course:\nTitle:${title}\nURL:${url}\n\n` +
        `Provide:\n1. Modules Covered\n2. Disadvantages\n3. Detailed Learning Outcomes`;
      const analysis = await cohereQuery(analysisPrompt, 500);

      panel.innerHTML = '<b>📘 Course Analysis:</b><br><br>' + analysis.replace(/\n/g, '<br>');
      panel.appendChild(closeBtn);

      const input = document.createElement('textarea');
      input.placeholder = 'Ask anything…';
      input.style.cssText = 'width:100%;height:60px;margin-top:10px;border-radius:5px;border:1px solid #ccc;padding:5px;resize:vertical;';
      const askBtn = document.createElement('button');
      askBtn.textContent = 'Ask';
      askBtn.style.cssText = 'margin-top:8px;padding:6px 12px;border:none;background:#007BFF;color:white;border-radius:4px;cursor:pointer;float:right;';
      const reply = document.createElement('div');
      reply.style.cssText = 'clear:both;margin-top:15px;';
      askBtn.onclick = async () => {
        if (!input.value.trim()) return;
        reply.innerHTML = '⏳ Thinking…';
        reply.innerHTML = '<b>💬 Response:</b><br>' + (await cohereQuery(input.value)).replace(/\n/g, '<br>');
      };
      panel.append(input, askBtn, reply);

      const modBtn = document.createElement('button');
      modBtn.textContent = '📋 Modules';
      modBtn.style.cssText = 'margin-top:10px;padding:6px 12px;border:none;background:#6c757d;color:white;border-radius:4px;cursor:pointer;float:left;';
      panel.appendChild(modBtn);

      const modulesArea = document.createElement('div');
      modulesArea.style = 'margin-top:15px;clear:both;';
      panel.appendChild(modulesArea);

      modBtn.onclick = () => {
        modulesArea.innerHTML = '<b>📂 Course Modules</b><br><br>';
        const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
        if (!mods.length) {
          modulesArea.innerHTML += '❌ Could not find modules.';
          return;
        }

        modulesArea.innerHTML = '';
        mods.forEach((m, i) => {
          const key = 'udemyMod-' + i;
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.checked = localStorage.getItem(key) === '1';
          chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
          const lbl = document.createElement('label');
          lbl.style = 'display:block;margin:5px 0;';
          lbl.append(chk, ' ', m.innerText.trim());
          modulesArea.appendChild(lbl);
        });

        // always clear past results below buttons
        const outputBox = document.createElement('div');
        outputBox.id = 'outputBox';
        outputBox.style = 'margin-top:15px;clear:both;';
        modulesArea.appendChild(outputBox);

        const addOrReplaceButton = (btnId, text, style, handler) => {
          let btn = document.getElementById(btnId);
          if (!btn) {
            btn = document.createElement('button');
            btn.id = btnId;
            btn.textContent = text;
            btn.style.cssText = style;
            modulesArea.appendChild(btn);
          }
          btn.onclick = handler;
        };

        // 🎯 Suggest Projects
        addOrReplaceButton('suggestProjectsBtn', '🎯 Suggest Projects',
          'margin-right:10px;padding:6px 12px;border:none;background:#28a745;color:white;border-radius:4px;cursor:pointer;',
          async () => {
            outputBox.innerHTML = '';
            const sel = mods.filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1').map(m => m.innerText.trim());
            if (!sel.length) return alert('Select modules first.');
            outputBox.innerHTML = '<b>⏳ Generating project ideas…</b>';
            const result = await cohereQuery(`I completed these modules:\n\n${sel.join('\n')}\n\nSuggest three hands-on project ideas.`, 350);
            outputBox.innerHTML = '<b>🚀 Project Ideas:</b><br>' + result.replace(/\n/g, '<br>');
          });

        // 📝 Quiz Me
        addOrReplaceButton('quizMeBtn', '📝 Quiz Me',
          'padding:6px 12px;border:none;background:#ffc107;color:#000;border-radius:4px;cursor:pointer;',
          async () => {
            const sel = mods.filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1').map(m => m.innerText.trim());
            if (!sel.length) return alert('Select modules first.');
            outputBox.innerHTML = '<b>⏳ Generating quiz…</b>';
            const qPrompt = `Generate EXACTLY 5 multiple-choice questions (with 4 options each) from:\n${sel.join('\n')}\nOnly 1 correct answer marked with <span class='answer'></span>. Format: Q1...\nA)...\nB)...\n`;
            const quizData = await cohereQuery(qPrompt, 600);
            localStorage.setItem('latestQuiz', quizData);
            outputBox.innerHTML = '<b>✅ Quiz ready! Click below to launch it:</b><br>';
            const launchBtn = document.createElement('button');
            launchBtn.textContent = '🚀 Start Quiz';
            launchBtn.style.cssText = 'margin-top:10px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:6px;cursor:pointer;';
            launchBtn.onclick = () => eval(`(${localStorage.getItem('quizLogic') || 'alert(\'Quiz logic missing\')'})()`);
            outputBox.appendChild(launchBtn);
          });
      };
    } catch (err) {
      panel.innerHTML = '❌ Error. See console.';
      panel.appendChild(closeBtn);
      console.error(err);
    }
  };

  document.body.appendChild(btn);
})();
