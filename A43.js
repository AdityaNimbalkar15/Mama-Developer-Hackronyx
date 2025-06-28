// ==================================================
// 📘 Udemy AI Bookmarklet Tool — FINAL INTEGRATED VERSION
// --------------------------------------------------
//  🎯 Helpers (auto/no‑prompt)
//      1. 📑  Transcript → Smart Notes PDF  (notesBtn)
//      2. 🌍  Real‑World Example → Explanation Box  (exampleBtn)
//  🛠️  Original features untouched
// ==================================================
(function () {
    if (document.getElementById('udemyAnalyzerBtn')) return;
    if (!location.hostname.includes('udemy.com')) {
        alert('⚠️ Open this on a Udemy course page.');
        return;
    }

    const TOKEN_KEY = 'udemyTokens';
    let tokenPoints = Number(localStorage.getItem(TOKEN_KEY) || 0);
    const saveTokens = () => localStorage.setItem(TOKEN_KEY, tokenPoints);
    const addTokens = d => { tokenPoints += d; saveTokens(); updateTokenUI(); };

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

    const apiKey = 'zXH8KUSA3ncfZcxvIAZx5boAlGlTirN6LJmp706Q';
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

    async function fetchTranscript() {
        const cueSel = '.transcript--highlight-cue--3T2w2,.transcript--transcript-cue--1pkkC,.ud-transcript-cue';
        for (let i = 0; i < 5; i++) {
            const cues = [...document.querySelectorAll(cueSel)];
            if (cues.length) return cues.map(c => c.innerText).join(' ').trim();
            await new Promise(r => setTimeout(r, 400));
        }
        return '';
    }

    function createWindow(title) {
        const wrapper = document.createElement('div');
        wrapper.style = 'position:fixed;bottom:200px;right:20px;width:300px;height:220px;padding:10px;background:white;border:2px solid #888;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,.3);overflow:auto;border-radius:8px;';

        const heading = document.createElement('h4');
        heading.textContent = title;
        heading.style = 'margin-top:0;margin-bottom:10px;font-size:16px;color:#333;';

        const textarea = document.createElement('textarea');
        textarea.style = 'width:100%;height:130px;padding:6px;font-size:13px;resize:none;';
        wrapper.appendChild(heading);
        wrapper.appendChild(textarea);

        const close = document.createElement('button');
        close.textContent = '✖';
        close.style = 'position:absolute;top:6px;right:8px;background:transparent;border:none;font-size:16px;cursor:pointer;color:#666;';
        close.onclick = () => wrapper.remove();

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '⬇️ PDF';
        downloadBtn.style = 'margin-top:5px;background:#2196F3;border:none;color:white;padding:5px 10px;border-radius:4px;cursor:pointer;';
        downloadBtn.onclick = () => {
            const blob = new Blob([textarea.value], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g,'_')}.pdf`;
            a.click();
        };

        wrapper.appendChild(close);
        if (title.includes('Notes')) wrapper.appendChild(downloadBtn);
        document.body.appendChild(wrapper);
        return textarea;
    }

    const notesBtn = document.createElement('button');
    notesBtn.textContent = '📑 Notes';
    notesBtn.style = 'position:fixed;bottom:90px;right:20px;z-index:9999;padding:8px;background:#009688;color:#fff;border:none;border-radius:6px;';
    notesBtn.onclick = async () => {
        notesBtn.textContent = '⏳...';
        const transcript = await fetchTranscript();
        if (!transcript) return alert('❌ Transcript not found.');
        const prompt = `You are a top-tier technical instructor. Create smart, structured notes from this transcript.
- Begin with a **1-line summary** of the core topic.
- Break down concepts with **bullet points**, highlighting key terms in **bold**.
- For important sections, include **brief use-case examples** (e.g., where/how it applies).
- If there’s a process, show it using a **step-by-step flow chart format** (use "→" arrows).
- Keep the tone clean, professional, and easy to revise later for a technical guide or PDF.

Transcript:
"""
[TRANSCRIPT]
"""
`;
        const result = await cohereQuery(prompt, 500, 0.6);
        const area = createWindow('Notes Output');
        area.value = result;
        notesBtn.textContent = '📑 Notes';
    };
    document.body.appendChild(notesBtn);

    const exampleBtn = document.createElement('button');
    exampleBtn.textContent = '🌍 Example';
    exampleBtn.style = 'position:fixed;bottom:130px;right:20px;z-index:9999;padding:8px;background:#8e24aa;color:#fff;border:none;border-radius:6px;';
    exampleBtn.onclick = async () => {
        exampleBtn.textContent = '⏳...';
        const transcript = await fetchTranscript();
        if (!transcript) return alert('❌ Transcript not found.');
        const prompt = `You are an expert teacher skilled at simplifying technical concepts using real-world analogies.\nFrom the following transcript, extract the main idea or concept being discussed. Then, generate **one short, clear real-world analogy** that best represents that concept. Start your analogy with a bold one-liner, followed by a 2-line summary that quickly helps a learner relate to it.\nTranscript:\n\"\"\"\n${transcript}\n\"\"\"`;
        const result = await cohereQuery(prompt, 180, 0.7);
        const area = createWindow('Real-World Example');
        area.value = result;
        exampleBtn.textContent = '🌍 Example';
    };
    document.body.appendChild(exampleBtn);

    document.body.appendChild(mainBtn);
})();
