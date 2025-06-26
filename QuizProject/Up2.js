// ✅ Udemy AI Bookmarklet Tool – Enhanced
// Independent Project/Quiz buttons + Retry feature + Tabs + Auto-save/export

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
    'display:none;position:fixed;bottom:90px;right:20px;width:400px;height:620px;padding:15px;background:white;color:black;' +
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

  const tabs = document.createElement('div');
  tabs.style = 'display:flex;gap:10px;margin-top:5px;margin-bottom:10px;';
  const projectTab = document.createElement('button');
  const quizTab = document.createElement('button');
  projectTab.textContent = '🚀 Projects';
  quizTab.textContent = '📝 Quiz';
  [projectTab, quizTab].forEach(tab => {
    tab.style.cssText = 'padding:6px 12px;border-radius:6px;border:none;cursor:pointer;background:#eee;';
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  const tabContent = document.createElement('div');
  panel.appendChild(tabContent);

  const loadingMsg = document.createElement('div');
  loadingMsg.style = 'margin:10px 0;color:gray;font-style:italic;';
  panel.appendChild(loadingMsg);

  projectTab.onclick = () => {
    loadingMsg.textContent = '';
    tabContent.innerHTML = localStorage.getItem('projectHTML') || '<i>No project suggestions yet.</i>';
    localStorage.setItem('activeTab', 'project');
  };
  quizTab.onclick = () => {
    loadingMsg.textContent = '';
    tabContent.innerHTML = localStorage.getItem('quizHTML') || '<i>No quiz generated yet.</i>';
    localStorage.setItem('activeTab', 'quiz');
  };

  const generateProjects = async () => {
    const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
    const sel = mods.filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1').map(m => m.innerText.trim());
    if (!sel.length) return alert('Please select modules first.');
    loadingMsg.textContent = '⏳ Generating project ideas…';
    const prompt = `I completed these modules:\n\n${sel.join('\n')}\n\nSuggest three hands-on project ideas.`;
    const res = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'command-r-plus', prompt, max_tokens: 400, temperature: 0.7 })
    });
    const data = await res.json();
    const output = '<b>🚀 Project Ideas:</b><br>' + (data.generations?.[0]?.text || 'No response').replace(/\n/g, '<br>');
    localStorage.setItem('projectHTML', output);
    loadingMsg.textContent = '';
    projectTab.click();
  };

  const generateQuiz = async () => {
    const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
    const sel = mods.filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1').map(m => m.innerText.trim());
    if (!sel.length) return alert('Please select modules first.');
    loadingMsg.textContent = '⏳ Generating quiz…';
    const prompt = `Generate EXACTLY 5 multiple-choice questions (with 4 options each) from:\n${sel.join('\n')}\nOnly 1 correct answer wrapped in <span class='answer'></span>.`;
    const res = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'command-r-plus', prompt, max_tokens: 600, temperature: 0.7 })
    });
    const data = await res.json();
    const text = data.generations?.[0]?.text || '⚠️ No quiz generated';
    localStorage.setItem('latestQuiz', text);
    localStorage.setItem('quizHTML', '<b>✅ Quiz is ready! Click below to launch it.</b><br><button onclick="(' + runQuiz.toString() + ')()" style="margin-top:10px;padding:8px 12px;background:#007bff;color:white;border:none;border-radius:6px;cursor:pointer;">🚀 Start Quiz</button>');
    loadingMsg.textContent = '';
    quizTab.click();
  };

  const modBtn = document.createElement('button');
  modBtn.textContent = '📋 Select Modules';
  modBtn.style.cssText = 'margin:10px 0;padding:6px 12px;border:none;background:#6c757d;color:white;border-radius:4px;cursor:pointer;';
  panel.appendChild(modBtn);

  modBtn.onclick = () => {
    const mods = [...document.querySelectorAll('div[data-purpose="curriculum-section-container"] h3')];
    if (!mods.length) return alert('❌ Could not find modules.');
    const area = document.createElement('div');
    area.innerHTML = '<b>📂 Select Modules</b><br><br>';
    mods.forEach((m, i) => {
      const key = 'udemyMod-' + i;
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = localStorage.getItem(key) === '1';
      chk.onchange = () => localStorage.setItem(key, chk.checked ? '1' : '0');
      const lbl = document.createElement('label');
      lbl.style = 'display:block;margin:5px 0;';
      lbl.append(chk, ' ', m.innerText.trim());
      area.appendChild(lbl);
    });

    const projBtn = document.createElement('button');
    projBtn.textContent = '🎯 Suggest Projects';
    projBtn.style.cssText = 'margin-top:10px;margin-right:10px;padding:6px 12px;border:none;background:#28a745;color:white;border-radius:4px;cursor:pointer;';
    projBtn.onclick = generateProjects;

    const quizBtn = document.createElement('button');
    quizBtn.textContent = '📝 Quiz Me';
    quizBtn.style.cssText = 'margin-top:10px;padding:6px 12px;border:none;background:#ffc107;color:#000;border-radius:4px;cursor:pointer;';
    quizBtn.onclick = generateQuiz;

    area.appendChild(projBtn);
    area.appendChild(quizBtn);
    tabContent.innerHTML = '';
    tabContent.appendChild(area);
    loadingMsg.textContent = '';
  };

  const runQuiz = () => {
    const quizData = localStorage.getItem('latestQuiz');
    if (!quizData) return alert('❌ No quiz data found.');
    const quizPanel = document.createElement('div');
    quizPanel.style.cssText =
      'position:fixed;top:5%;left:10%;width:80%;height:85%;z-index:10000;background:#fff;border-radius:10px;' +
      'box-shadow:0 0 25px rgba(0,0,0,0.3);padding:20px;overflow:auto;font-family:sans-serif;';
    quizPanel.innerHTML =
      '<button id="closeQuizPanel" style="position:absolute;top:10px;right:10px;border:none;background:#f44336;' +
      'color:white;border-radius:4px;padding:4px 12px;cursor:pointer;">✖</button>' +
      '<h2>📝 Module Quiz</h2><form id="quizForm"></form><button id="submitQuiz">Show Answers</button>' +
      '<button id="retryQuiz" style="margin-left:10px">🔁 Retry</button><div id="score"></div>';

    document.body.appendChild(quizPanel);
    document.getElementById('closeQuizPanel').onclick = () => quizPanel.remove();

    const form = quizPanel.querySelector('#quizForm');
    const blocks = quizData.match(/(?:Q?\d+[.)])[\s\S]*?(?=(?:Q?\d+[.)])|$)/g) || [];
    const correctMap = [];

    blocks.forEach((blk, qi) => {
      const lines = blk.trim().split('\n').filter(Boolean);
      const qLine = lines.shift();
      const qDiv = document.createElement('div');
      qDiv.innerHTML = `<b>${qLine.replace(/^Q?\d+[.)]\s*/, '')}</b><br>`;
      const options = lines.slice(0, 4).map((line, i) => {
        const isCorrect = /<span class=["']answer["']>/.test(line);
        const text = line.replace(/<span class=["']answer["']>/, '').replace('</span>', '').replace(/^[A-Da-d][).]\s*/, '').trim();
        return { text, isCorrect };
      });
      options.sort(() => Math.random() - 0.5);
      options.forEach((opt, oi) => {
        const id = `q${qi}o${oi}`;
        const label = document.createElement('label');
        label.style = 'display:block;padding:6px;border:1px solid #ccc;margin:4px 0;border-radius:4px;';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${qi}`;
        radio.value = opt.text;
        radio.setAttribute('data-correct', opt.isCorrect);
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + opt.text));
        qDiv.appendChild(label);
        if (opt.isCorrect) correctMap[qi] = label;
      });
      form.appendChild(qDiv);
    });

    document.getElementById('submitQuiz').onclick = () => {
      let right = 0;
      correctMap.forEach((correctLabel, qi) => {
        const checked = form.querySelector(`input[name="q${qi}"]:checked`);
        if (checked) {
          const userLbl = checked.closest('label');
          if (checked.getAttribute('data-correct') === 'true') {
            userLbl.style.background = '#c8e6c9';
            right++;
          } else {
            userLbl.style.background = '#ffcdd2';
            correctLabel.style.background = '#e0f2f1';
          }
        } else {
          correctLabel.style.background = '#e0f2f1';
        }
      });
      document.getElementById('score').innerHTML = `<br><b>✅ Score: ${right}/${correctMap.length}</b>`;
    };

    document.getElementById('retryQuiz').onclick = () => {
      quizPanel.remove();
      runQuiz();
    };
  };

  btn.onclick = async () => {
    panel.style.display = 'block';
    (localStorage.getItem('activeTab') === 'quiz' ? quizTab : projectTab).click();
  };

  document.body.appendChild(btn);
  localStorage.setItem('quizLogic', runQuiz.toString());
})();
