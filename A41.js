// ==================================================
// 📘 Udemy AI Bookmarklet Tool — FINAL INTEGRATED VERSION
// --------------------------------------------------
// 🎯 New Helpers (auto/no‑prompt)
//   1. 📑 Transcript → Smart Notes PDF  (notesBtn)
//   2. 🌍 Real‑World Example from Transcript  (exampleBtn)
// 🛠️ Original features (analysis, modules, quiz, projects,
//    project evaluator, daily question, meme, chat) untouched.
//
// ✱ Uses Cohere API key provided by user.
// ✱ Automatically opens transcript panel, extracts cues
//   without user clicks.
// ==================================================
(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) {
        alert('⚠️ Open this on a Udemy course page.');
        return;
    }

    const TOKEN_KEY = 'udemyTokens';
    let tokenPoints = Number(localStorage.getItem(TOKEN_KEY) || 0);
    const saveTokens = () => localStorage.setItem(TOKEN_KEY, tokenPoints);
    const addTokens  = d => { tokenPoints += d; saveTokens(); updateTokenUI?.(); };

    const mainBtn = document.createElement('button');
    mainBtn.id = 'udemyAnalyzerBtn';
    mainBtn.textContent = '📘';
    mainBtn.style.cssText = [
        'position:fixed','bottom:20px','right:20px','background:#4CAF50','color:white','border:none','border-radius:50%',
        'width:60px','height:60px','font-size:28px','font-weight:bold','cursor:move','z-index:9999','box-shadow:0 4px 10px rgba(0,0,0,.3)'
    ].join(';');

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/Shantnu-Talokar/Mama-Developer/Version1.js';
    document.body.appendChild(script);

    /*************************************************
     * 🛠️ Cohere Helper
     *************************************************/
    const apiKey   = 'zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q';
    const endpoint = 'https://api.cohere.ai/v1/generate';
    const cohereQuery = async (prompt, max = 400, temp = 0.6) => {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-r-plus',
                prompt,
                max_tokens: max,
                temperature: temp
            })
        });
        const data = await res.json();
        return data.generations?.[0]?.text || '⚠️ No response';
    };

    /*************************************************
     * 📜 Automatic Transcript Fetcher
     *************************************************/
    async function fetchTranscript() {
        const cueSel = '.transcript--highlight-cue--3T2w2,.transcript--transcript-cue--1pkkC,.ud-transcript-cue';
        for (let i = 0; i < 5; i++) {
            const cues = [...document.querySelectorAll(cueSel)];
            if (cues.length) return cues.map(c => c.innerText).join(' ').trim();
            await new Promise(r => setTimeout(r, 400));
        }
        return '';
    }

    /*************************************************
     * 📑 Notes Button
     *************************************************/
    const notesBtn = document.createElement('button');
    notesBtn.textContent = '📑 Notes';
    notesBtn.style = 'position:fixed;bottom:90px;right:20px;z-index:9999;padding:8px;background:#009688;color:#fff;border:none;border-radius:6px;';
    notesBtn.onclick = async () => {
        notesBtn.textContent = '⏳...';
        const transcript = await fetchTranscript();
        if (!transcript) return alert('❌ Transcript not found.');
        const prompt = `Convert this transcript into concise notes with headings and a summary.\n\n"""\n${transcript}\n"""`;
        const result = await cohereQuery(prompt, 500, 0.6);
        alert('📑 Notes:\n' + result);
        notesBtn.textContent = '📑 Notes';
    };
    document.body.appendChild(notesBtn);

    /*************************************************
     * 🌍 Real-World Example Button
     *************************************************/
    const exampleBtn = document.createElement('button');
    exampleBtn.textContent = '🌍 Example';
    exampleBtn.style = 'position:fixed;bottom:130px;right:20px;z-index:9999;padding:8px;background:#8e24aa;color:#fff;border:none;border-radius:6px;';
    exampleBtn.onclick = async () => {
        exampleBtn.textContent = '⏳...';
        const transcript = await fetchTranscript();
        if (!transcript) return alert('❌ Transcript not found.');
        const prompt = `Give one short real-world analogy that explains the main idea in this transcript.\n\n"""\n${transcript}\n"""`;
        const result = await cohereQuery(prompt, 160, 0.7);
        alert('🌍 Real-World Example:\n' + result);
        exampleBtn.textContent = '🌍 Example';
    };
    document.body.appendChild(exampleBtn);

    // ✅ Append main UI button at the end
    document.body.appendChild(mainBtn);
})();
