
const express = require("express");
const axios = require("axios");

const {
    getRecommendations
} = require("../utils/recommendationEngine");

const router = express.Router();

// Use the deployed Flask URL in production.
// Keep localhost as the fallback for local development.
const AI_SERVICE_URL = (
    process.env.AI_SERVICE_URL || "http://127.0.0.1:5001"
).replace(/\/+$/, "");


// --------------------------------------------------
// 1. DETECT USER INTERESTS
// --------------------------------------------------

function extractInterests(message) {
    const text = String(message || "").toLowerCase();

    const interestPatterns = {
        history: /\b(history|historical|historic|heritage)\b/,
        architecture: /\b(architecture|architectural)\b/,
        culture: /\b(culture|cultural)\b/,
        nature: /\b(nature|wildlife|forest|mountains)\b/,
        beaches: /\b(beach|beaches)\b/,
        food: /\b(food|foods|cuisine|restaurants?|eating)\b/,
        shopping: /\b(shopping|markets?|bazaars?)\b/,
        nightlife: /\b(nightlife|night life|clubs?)\b/,
        adventure: /\b(adventure|trekking|hiking|rafting)\b/,
        temples: /\b(temples?|religious places)\b/
    };

    return Object.entries(interestPatterns)
        .filter(([interest, pattern]) => pattern.test(text))
        .map(([interest]) => interest);
}


// --------------------------------------------------
// 2. DETECT EXPLICIT RECOMMENDATION INTENT
// --------------------------------------------------

function isRecommendationRequest(message) {
    const text = String(message || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const recommendationPatterns = [
        /\b(recommend|recommendations?|suggest|suggestions?)\b/,
        /\b(find|show|list|discover)\b.{0,60}\b(destinations?|places?|attractions?|hotels?|beaches|temples?|restaurants?)\b/,
        /\b(best|top)\b.{0,50}\b(destinations?|places?|attractions?|hotels?|beaches|temples?|restaurants?)\b/,
        /\b(destinations?|places?|attractions?|hotels?)\b.{0,60}\b(recommend|suggest|best|top)\b/
    ];

    const hasRecommendationLanguage =
        recommendationPatterns.some(pattern => pattern.test(text));

    const hasTravelContext =
        /\b(travel|trip|destination|destinations|place|places|attraction|attractions|hotel|hotels|beach|beaches|temple|temples|restaurant|restaurants|tourist|visit|sightseeing)\b/.test(text);

    return hasRecommendationLanguage && hasTravelContext;
}


// --------------------------------------------------
// 3. EXISTING AI RECOMMENDATION PROXY
// --------------------------------------------------

router.post("/recommend", async (req, res) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/api/recommend`,
            req.body,
            { timeout: 60000 }
        );

        return res.status(response.status).json(response.data);

    } catch (error) {
        console.error(
            "AI recommendation service error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 503).json({
            error: "AI recommendation service is currently unavailable."
        });
    }
});


// --------------------------------------------------
// 4. GEMINI CHAT + CONDITIONAL PERSONALIZED RECOMMENDATIONS
// --------------------------------------------------

router.post("/chat", async (req, res) => {
    try {
        const message = req.body?.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        // Step 1: Detect interests.
        const interests = extractInterests(message);

        // Step 2: Check whether recommendations were requested.
        const recommendationRequested =
            isRecommendationRequest(message);

        // Step 3: Generate recommendations only when requested.
        let personalizedRecommendations = null;

        if (recommendationRequested && interests.length > 0) {
            personalizedRecommendations = getRecommendations({
                interests
            });
        }

        // Step 4: Send the message and optional recommendations to Flask.
        const flaskPayload = {
            ...req.body,
            personalized_recommendations:
                personalizedRecommendations
        };

        const response = await axios.post(
            `${AI_SERVICE_URL}/api/chat`,
            flaskPayload,
            { timeout: 120000 }
        );

        // Step 5: Return the AI response and recommendation status.
        return res.status(response.status).json({
            ...response.data,

            detected_interests: interests,

            recommendation_requested: recommendationRequested,

            personalized_recommendations:
                personalizedRecommendations
        });

    } catch (error) {
        console.error(
            "Gemini chat service error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 503).json({
            error: "AI chat service is currently unavailable."
        });
    }
});


module.exports = router;
