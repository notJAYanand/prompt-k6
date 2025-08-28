const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serve static files from 'public' folder

const PORT = 3000;

// --- In your /generate-and-run-test endpoint ---
app.post('/generate-and-run-test', async (req, res) => {
    const userPrompt = req.body.prompt;
    
    try {
        // 1. GENERATE THE k6 SCRIPT
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const generationPrompt = `
            You are an expert in k6 performance testing.
            Based on the user's request, generate a complete k6 JavaScript test script.
            Do NOT include any explanation, just the raw JavaScript code.
            User's request: "${userPrompt}"
        `;
        
        const result = await model.generateContent(generationPrompt);
        const k6Script = result.response.text();

        // --- k6 execution will go here ---
        res.send({ script: k6Script });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).send({ error: "Failed to generate AI script." });
    }
});


// API endpoint to handle the user's prompt
// app.post('/generate-and-run-test', async (req, res) => {
//     const userPrompt = req.body.prompt;
    
//     // --- AI integration will go here ---
//     console.log("Received prompt:", userPrompt);
    
//     // For now, a placeholder response
//     res.send({ message: "Request received. AI generation is next!" });
// });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});