// ✅ Udemy AI Bookmarklet Tool – FINAL VERSION
// Features: Analysis, Chat, Project Suggestions, Quiz (with realistic MCQs)
// Use with Bookmarklet:
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

                const projBtn = document.createElement('button');
                projBtn.textContent = '🎯 Suggest Projects';
                projBtn.style.cssText =
                    'margin-top:10px;padding:6px 12px;border:none;background:#28a745;color:white;border-radius:4px;cursor:pointer;';
                projBtn.onclick = async () => {
                    const sel = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());

                    if (!sel.length) return alert('Select modules first.');

                    // 👉 Create or reuse a container for the project ideas
                    let ideasDiv = document.getElementById('projectIdeasBox');
                    if (!ideasDiv) {
                        ideasDiv = document.createElement('div');
                        ideasDiv.id = 'projectIdeasBox';
                        modulesArea.appendChild(ideasDiv);
                    }

                    ideasDiv.innerHTML = '<b>⏳ Fetching ideas…</b>';

                    const ideas = await cohereQuery(
                        `I completed these modules:\n\n${sel.join('\n')}\n\nSuggest three hands-on project ideas.`,
                        350
                    );

                    ideasDiv.innerHTML = '<b>🚀 Project Ideas:</b><br>' + ideas.replace(/\n/g, '<br>');
                };

                modulesArea.appendChild(projBtn);

                // 🔥 QUIZ BUTTON (uses same modules)
                const quizBtn = document.createElement('button');
                quizBtn.textContent = '📝 Quiz Me';
                quizBtn.style.cssText =
                    'margin-top:10px;margin-left:8px;padding:6px 12px;border:none;background:#ffc107;color:#000;border-radius:4px;cursor:pointer;';
                modulesArea.appendChild(quizBtn);

                let overlay = document.getElementById('udemyQuizOverlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'udemyQuizOverlay';
                    overlay.style.cssText =
                        'display:none;position:fixed;top:10%;left:10%;width:80%;height:80%;background:#fffbd6;' +
                        'border:6px solid #ff9800;border-radius:20px;z-index:10000;padding:25px;overflow:auto;' +
                        'box-shadow:0 8px 25px rgba(0,0,0,0.4);font-family:sans-serif;';
                    document.body.appendChild(overlay);
                }

                quizBtn.onclick = async () => {
                    const sel = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());

                    if (!sel.length) return alert('Select modules first.');
                    const chosen = mods
                        .filter((_, i) => localStorage.getItem('udemyMod-' + i) === '1')
                        .map(m => m.innerText.trim());

                    if (!chosen.length) return alert('Select modules first.');

                    // ✅ Create or reuse a div for quiz output
                    let quizDiv = document.getElementById('quizOutputBox');
                    if (!quizDiv) {
                        quizDiv = document.createElement('div');
                        quizDiv.id = 'quizOutputBox';
                        modulesArea.appendChild(quizDiv);
                    }

                    quizDiv.innerHTML = '<h2>📝 Generating quiz…</h2>';

                    const qPrompt =
                        `You are an advanced technical course quiz generator.\n` +
                        `Generate EXACTLY 5 high-quality multiple-choice questions (MCQs) based strictly on the technical content from these modules:\n` +
                        `${sel.join('\n')}\n\n` +
                        `Guidelines:\n` +
                        `1. Questions must cover a range of difficulty levels: 2 easy, 2 medium, and 1 hard.\n` +
                        `2. Only include content that is clearly present in the modules.\n` +
                        `3. Each question must be clear, unambiguous, and test conceptual understanding or practical application.\n` +
                        `4. Include exactly 4 options (A–D). ONLY ONE must be correct.\n` +
                        `5. Wrap the correct option in <span class="answer"></span> tags.\n` +
                        `6. Avoid repeating questions or options.\n\n` +
                        `Format strictly as:\nQ1. <question>\nA) <opt>\nB) <opt>\nC) <opt>\nD) <opt>\n\n` +
                        `Begin:`;


                    try {
                        const txt = await cohereQuery(qPrompt, 650);

                        // ✅ Show launch button instead of auto-rendering full quiz here
                        quizDiv.innerHTML =
                            '<b>✅ Quiz is ready!</b><br><button id=\"launchQuizBtn\" style=\"margin-top:10px;padding:6px 12px;background:#007BFF;color:white;border:none;border-radius:4px;cursor:pointer;\">🚀 Start Quiz</button>';

                        document.getElementById('launchQuizBtn').onclick = () => {
                            localStorage.setItem('latestQuiz', txt);
                            eval(`(${runQuiz.toString()})()`); // runQuiz must be globally defined
                        };
                    } catch (err) {
                        quizDiv.innerHTML = '<p style=\"color:red\">❌ Failed to generate quiz.</p>';
                        console.error(err);
                    }
                };
            };
        } catch (err) {
            panel.innerHTML = '❌ Error. See console.';
            panel.appendChild(closeBtn);
            console.error(err);
        }
    };
    function runQuiz() {
        const quizData = localStorage.getItem('latestQuiz');
        if (!quizData) return alert('❌ No quiz data found.');

        const quizPanel = document.createElement('div');
        quizPanel.style.cssText =
            'position:fixed;top:5%;left:10%;width:80%;height:85%;z-index:10000;background:#fff;border-radius:10px;' +
            'box-shadow:0 0 25px rgba(0,0,0,0.3);padding:20px;overflow:auto;font-family:sans-serif;';
        quizPanel.innerHTML =
            '<button id=\"closeQuizPanel\" style=\"position:absolute;top:10px;right:10px;border:none;background:#f44336;' +
            'color:white;border-radius:4px;padding:4px 12px;cursor:pointer;\">✖</button>' +
            '<h2>📝 Module Quiz</h2><form id=\"quizForm\"></form><button id=\"submitQuiz\">Show Answers</button>' +
            '<button id=\"retryQuiz\" style=\"margin-left:10px\">🔁 Retry</button><div id=\"score\"></div>';

        document.body.appendChild(quizPanel);
        document.getElementById('closeQuizPanel').onclick = () => quizPanel.remove();

        const form = quizPanel.querySelector('#quizForm');
        const blocks = quizData.match(/(?:Q?\\d+[.)])[\\s\\S]*?(?=(?:Q?\\d+[.)])|$)/g) || [];
        const correctMap = [];

        blocks.forEach((blk, qi) => {
            const lines = blk.trim().split('\\n').filter(Boolean);
            const qLine = lines.shift();
            const qDiv = document.createElement('div');
            qDiv.innerHTML = `<b>${qLine.replace(/^Q?\\d+[.)]\\s*/, '')}</b><br>`;
            const options = lines.slice(0, 4).map((line, i) => {
                const isCorrect = /<span class=[\"']answer[\"']>/.test(line);
                const text = line.replace(/<span class=[\"']answer[\"']>/, '').replace('</span>', '').replace(/^[A-Da-d][).]\\s*/, '').trim();
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
                const checked = form.querySelector(`input[name=\"q${qi}\"]:checked`);
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
    }

    document.body.appendChild(btn);
})();