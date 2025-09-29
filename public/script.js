async function runTest() {
    const prompt = document.getElementById('prompt-input').value;

    const response = await fetch('/generate-and-run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });

    const data = await response.json();
}
    // document.getElementById('generated-script').textContent = data.script || data.error;


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
                document.getElementById('scriptSection').style.display = 'block';
                document.getElementById('results').style.display = 'none';

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
                document.getElementById('results').style.display = 'block';

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
                document.getElementById('scriptSection').style.display = 'block';
                
                document.getElementById('analysis').textContent = data.analysis;
                document.getElementById('summary').textContent = data.summary;
                document.getElementById('results').style.display = 'block';

            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        }

async function getAnalysis() {
    // if (!lastTestResults) {
    //     alert('No test results available for analysis. Run a test first.');
    //     return;
    // }

    // Update button state
    const analysisBtn = document.getElementById('getAnalysisBtn');
    const originalText = analysisBtn.textContent;
    analysisBtn.textContent = 'Analyzing...';
    analysisBtn.disabled = true;

    try {
        const response = await fetch('/analyze-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: lastTestResults })
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

        function regenerateScript() {
            document.getElementById('scriptSection').style.display = 'none';
            document.getElementById('results').style.display = 'none';
            generateScript();
        }

    // function runEditedScript() {
    //     const editedScript = document.getElementById('generatedScript').value;
        
    //     fetch('/run-edited-script', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ script: editedScript })
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         // Display results same as before
    //         displayResults(data);
    //     });
    // }

    // document.getElementById('generateBtn').addEventListener('click', generateAndRunTest);
    // Results
    // document.getElementById('generated-script').textContent = data.script;
    // document.getElementById('test-results').textContent = `AI Analysis:\n${data.analysis}\n\nRaw Output:\n${data.summary}`;