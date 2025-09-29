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

// ENDPOINT 1: Generate Script Only
app.post('/generate-script', async (req, res) => {
    const userPrompt = req.body.prompt;

    try {
        // GENERATE THE k6 SCRIPT
        const geminiModel = process.env.GEMINI_MODEL;
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const generationPrompt = `
            You are an expert in k6. Your task is to generate a complete k6 
            JavaScript test script based on the user's request.  
            

            IMPORTANT: Follow these k6 import rules strictly:
            - Use "import http from 'k6/http';" for HTTP requests
            - Use "import { sleep, check } from 'k6';" for sleep and check functions
            - Use "import { Rate, Counter } from 'k6/metrics';" for custom metrics
            - Never use "import { sleep } from 'k6/sleep';" - this is incorrect

            Crucially, you must only output the raw JavaScript code and nothing else.
            Do not include any explanation or markdown formatting like \`\`\`javascript.

            User's request: "${userPrompt}"
        `;

        let result = await model.generateContent(generationPrompt);
        const k6Script = result.response.text();

        // VALIDATION GUARD RAIL
        if (!k6Script || !k6Script.includes("import http from 'k6/http'")) {
            console.error("AI generated an invalid or empty script:", k6Script);
            return res.status(500).send({
                error: "The AI failed to generate a valid k6 script. Please try rephrasing your prompt."
            });
        }

        // SEND ONLY THE GENERATED SCRIPT
        res.send({
            script: k6Script,
            message: "Script generated successfully. Review and edit if needed, then run the test."
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).send({
            error: "Failed to generate AI script.",
            details: error.message
        });
    }
});

// ENDPOINT 2: Run Script Only
// app.post('/run-script', async (req, res) => {
//     const { script } = req.body;

//     try {
//         // VALIDATION GUARD RAIL
//         if (!script || !script.includes("import http from 'k6/http'")) {
//             return res.status(400).send({
//                 error: "Invalid k6 script format. Make sure it includes 'import http from 'k6/http''."
//             });
//         }

//         // SAVE AND EXECUTE THE SCRIPT
//         const scriptPath = path.join(__dirname, 'temp_test.js');
//         fs.writeFileSync(scriptPath, script);

//         const resultsPath = path.join(__dirname, 'results.json');
//         const command = `k6 run ${scriptPath} --summary-export=${resultsPath}`;

//         const { stdout, stderr } = await execPromise(command);

//         if (stderr) {
//             console.warn(`k6 execution produced warnings: ${stderr}`);
//         }

//         const testSummaryJson = fs.readFileSync(resultsPath, 'utf8');

//         // ANALYZE THE RESULTS WITH AI
//         const geminiModel = process.env.GEMINI_MODEL;
//         const apiKey = process.env.GEMINI_API_KEY;
//         const genAI = new GoogleGenerativeAI(apiKey);
//         const model = genAI.getGenerativeModel({ model: geminiModel });

//         const analysisPrompt = `
//             You are a performance testing expert. Analyze the following k6 JSON output and provide a brief, human-readable summary.

//             Follow these rules strictly:
//             1.  Start with a one-sentence conclusion: "Conclusion: The test passed successfully." or "Conclusion: The test failed."
//             2.  To determine if the test passed or failed, look at the "http_req_failed" metric. Inside it, look for the "value" property. If "value" is 0, the test passed with a 0% error rate. If "value" is not 0, the test failed. Do not state there are failures if the value is 0.
//             3.  Report the requests per second from the "http_reqs" metric's "rate" property.
//             4.  Report the 95th percentile response time from the "http_req_duration" metric's "p(95)" property.

//             Here is the JSON data to analyze: ${testSummaryJson}
//         `;

//         const result = await model.generateContent(analysisPrompt);
//         const analysisText = result.response.text();

//         // SEND THE COMPLETE TEST RESULTS
//         res.send({
//             summary: stdout, // The raw text output from the k6 command
//             analysis: analysisText, // The AI-generated summary
//             results: JSON.parse(testSummaryJson) // The full JSON data for charting
//         });

//     } catch (error) {
//         console.error("Script Execution Error:", error);
//         if (!res.headersSent) {
//             res.status(500).send({
//                 error: "Failed to execute script.",
//                 details: error.stderr || error.message
//             });
//         }
//     }
// });

app.post('/run-script', async (req, res) => {
    const { script } = req.body;

    try {
        // VALIDATION GUARD RAIL
        if (!script || !script.includes("import http from 'k6/http'")) {
            return res.status(400).send({
                error: "Invalid k6 script format. Make sure it includes 'import http from 'k6/http''."
            });
        }

        // SAVE AND EXECUTE THE SCRIPT
        const scriptPath = path.join(__dirname, 'temp_test.js');
        fs.writeFileSync(scriptPath, script);

        const resultsPath = path.join(__dirname, 'results.json');
        const command = `k6 run ${scriptPath} --summary-export=${resultsPath}`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.warn(`k6 execution produced warnings: ${stderr}`);
        }

        const testSummaryJson = fs.readFileSync(resultsPath, 'utf8');

        // SEND ONLY THE RAW TEST RESULTS (NO AI ANALYSIS YET)
        res.send({
            summary: stdout, // The raw text output from the k6 command
            results: JSON.parse(testSummaryJson), // The full JSON data
            message: "Test completed successfully. Click 'Get AI Analysis' for intelligent summary."
        });

    } catch (error) {
        console.error("Script Execution Error:", error);
        if (!res.headersSent) {
            res.status(500).send({
                error: "Failed to execute script.",
                details: error.stderr || error.message
            });
        }
    }
});

app.post('/analyze-results', async (req, res) => {
    // const { results } = req.body; // The JSON results from the previous run
    const resultsPath = path.join(__dirname, 'results.json');
    const results = fs.readFileSync(resultsPath, 'utf8');

    try {
        if (!results) {
            return res.status(400).send({
                error: "No test results provided for analysis."
            });
        }

        // ANALYZE THE RESULTS WITH AI
        const geminiModel = process.env.GEMINI_MODEL;
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const analysisPrompt = `
            You are a performance testing expert. Analyze the following k6 JSON output and provide a brief, human-readable summary.

            Follow these rules strictly:
            1.  Start with a one-sentence conclusion: "Conclusion: The test passed successfully." or "Conclusion: The test failed."
            2.  To determine if the test passed or failed, look at the "http_req_failed" metric. Inside it, look for the "value" property. If "value" is 0, the test passed with a 0% error rate. If "value" is not 0, the test failed. Do not state there are failures if the value is 0.
            3.  Report the requests per second from the "http_reqs" metric's "rate" property.
            4.  Report the 95th percentile response time from the "http_req_duration" metric's "p(95)" property.

            Here is the JSON data to analyze: ${JSON.stringify(results)}
        `;

        const result = await model.generateContent(analysisPrompt);
        const analysisText = result.response.text();

        // SEND ONLY THE AI ANALYSIS
        res.send({
            analysis: analysisText
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        if (!res.headersSent) {
            res.status(500).send({
                error: "Failed to generate AI analysis.",
                details: error.message
            });
        }
    }
});

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
        const analysisPrompt = `
                                You are a performance testing expert. Analyze the following k6 JSON output and provide a brief, human-readable summary.

                                Follow these rules strictly:
                                1.  Start with a one-sentence conclusion: "Conclusion: The test passed successfully." or "Conclusion: The test failed."
                                2.  To determine if the test passed or failed, look at the "http_req_failed" metric. Inside it, look for the "value" property. If "value" is 0, the test passed with a 0% error rate. If "value" is not 0, the test failed. Do not state there are failures if the value is 0.
                                3.  Report the requests per second from the "http_reqs" metric's "rate" property.
                                4.  Report the 95th percentile response time from the "http_req_duration" metric's "p(95)" property.

                                Here is the JSON data to analyze: ${testSummaryJson}
                                `;

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