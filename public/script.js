async function runTest() {
    const prompt = document.getElementById('prompt-input').value;

    const response = await fetch('/generate-and-run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });

    const data = await response.json();

    document.getElementById('generated-script').textContent = data.script || data.error;

    // Results
    document.getElementById('generated-script').textContent = data.script;
    document.getElementById('test-results').textContent = `AI Analysis:\n${data.analysis}\n\nRaw Output:\n${data.summary}`;
}