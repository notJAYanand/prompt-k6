const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const util = require('util');


// Promisify the exec function to use async/await
const execPromise = util.promisify(exec);

require('dotenv').config();
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serve static files from 'public' folder

const PORT = 3000;

// --- In your /generate-and-run-test endpoint ---
app.post('/generate-and-run-test', async (req, res) => {
    const userPrompt = req.body.prompt;

    try {
        // GENERATE THE k6 SCRIPT
        const geminiModel = process.env.GEMINI_MODEL;
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const generationPrompt = `
            You are an expert in k6. Your task is to generate a complete k6 
            JavaScript test script based on the user's request. Crucially, 
            you must only output the raw JavaScript code and nothing else. 
            Do not include any explanation or markdown formatting like \`\`\`javascript.
            User's request: "${userPrompt}"
        `;

        let result = await model.generateContent(generationPrompt);
        const k6Script = result.response.text();

        // --- k6 execution will go here ---

        // VALIDATION GUARD RAIL
        // Check if the generated script is valid before trying to run it.
        if (!k6Script || !k6Script.includes("import http from 'k6/http'")) {
            console.error("AI generated an invalid or empty script:", k6Script);
            return res.status(500).send({
                error: "The AI failed to generate a valid k6 script. Please try rephrasing your prompt."
            });
        }

        // SAVE AND EXECUTE THE SCRIPT
        const scriptPath = path.join(__dirname, 'temp_test.js');
        fs.writeFileSync(scriptPath, k6Script);

        const resultsPath = path.join(__dirname, 'results.json');
        const command = `k6 run ${scriptPath} --summary-export=${resultsPath}`;


        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.warn(`k6 execution produced warnings: ${stderr}`);
        }

        const testSummaryJson = fs.readFileSync(resultsPath, 'utf8');

        // ANALYZE THE RESULTS WITH AI 
        const analysisPrompt = `You are a performance testing expert. Analyze the following k6 JSON output and provide a brief, human-readable summary for a non-technical stakeholder. Highlight the requests per second, the p(95) response time, and the failure rate. Start your analysis with a conclusion (e.g., "Conclusion: The test passed successfully."). JSON results: ${testSummaryJson}`;
        
        result = await model.generateContent(analysisPrompt);
        const analysisText = result.response.text();
        
        // SEND THE FINAL, COMPLETE RESPONSE
        res.send({ 
            script: k6Script, 
            summary: stdout, // The raw text output from the k6 command
            analysis: analysisText, // The AI-generated summary
            results: JSON.parse(testSummaryJson) // The full JSON data for charting
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).send({ error: "Failed to generate AI script." });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});