const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serve static files from 'public' folder

const PORT = 3000;

// API endpoint to handle the user's prompt
app.post('/generate-and-run-test', async (req, res) => {
    const userPrompt = req.body.prompt;
    
    // --- AI integration will go here ---
    console.log("Received prompt:", userPrompt);
    
    // For now, a placeholder response
    res.send({ message: "Request received. AI generation is next!" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});