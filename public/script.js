async function runTest() {
    const prompt = document.getElementById('prompt-input').value;

    const response = await fetch('/generate-and-run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });

    const data = await response.json();
}

async function generateScript() {
    const prompt = document.getElementById('prompt-input').value;
    if (!prompt.trim()) {
        alert('Please enter a test description');
        return;
    }

    try {
        const response = await fetch('/generate-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate script');
        }

        // Show the generated script
        document.getElementById('generatedScript').value = data.script;

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

let lastTestResults = null; // Store results for analysis
async function runScript() {
    const script = document.getElementById('generatedScript').value;
    if (!script.trim()) {
        alert('No script to run');
        return;
    }

    try {
        const response = await fetch('/run-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to run script');
        }

        // Show the results
        document.getElementById('analysis').textContent = data.analysis;
        document.getElementById('summary').textContent = data.summary;

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

async function generateAndRun() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt.trim()) {
        alert('Please enter a test description');
        return;
    }

    try {
        const response = await fetch('/generate-and-run-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate and run test');
        }

        // Show both script and results
        document.getElementById('generatedScript').value = data.script;

        document.getElementById('analysis').textContent = data.analysis;
        document.getElementById('summary').textContent = data.summary;

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

async function getAnalysis() {

    // Update button state
    const analysisBtn = document.getElementById('getAnalysisBtn');
    const originalText = analysisBtn.textContent;
    analysisBtn.textContent = 'Analyzing...';
    analysisBtn.disabled = true;

    try {
        const response = await fetch('/analyze-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: lastTestResults }) //this is cheating, we are getting results in the server from results.json -- im too lazy to fix it, will fix later
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get analysis');
        }

        // Show the AI analysis
        document.getElementById('analysis').textContent = data.analysis;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('analysis').textContent = 'Analysis failed: ' + error.message;
    } finally {
        // Reset button
        analysisBtn.textContent = originalText;
        analysisBtn.disabled = false;
    }
}

async function getComprehensiveAnalysis() {
    const comprehensiveAnalysisBtn = document.getElementById('getComprehensiveAnalysisBtn');
    let originalText = comprehensiveAnalysisBtn.textContent;
    comprehensiveAnalysisBtn.textContent = 'Analyzing...';
    comprehensiveAnalysisBtn.disabled = true;

    try {
        const response = await fetch('/comprehensive-results-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: lastTestResults }) // "oops i did it again" - Brittany Spears
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get analysis');
        }

        // Show the AI analysis
        document.getElementById('comprehensiveAnalysis').textContent = data.analysis;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('comprehensiveAnalysis').textContent = 'Analysis failed: ' + error.message;
    } finally {
        // Reset button
        comprehensiveAnalysisBtn.textContent = originalText;
        comprehensiveAnalysisBtn.disabled = false;
    }
}

function regenerateScript() {
    generateScript();
}