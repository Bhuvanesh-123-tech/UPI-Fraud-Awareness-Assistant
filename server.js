require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;
        const history = req.body.history || [];

        if (!message) {
            return res.status(400).json({
                error: "No message provided."
            });
        }

        const systemInstruction = `
You are the UPI Fraud Awareness Assistant.

Your purpose is to help people recognize possible UPI fraud and stay safe.

Understand natural language, slang, abbreviations, spelling mistakes, incomplete sentences, and typos.

Have a natural conversation. Do not use a fixed response system.

If the user's situation is unclear, ask a useful follow-up question instead of guessing.

If the situation appears suspicious, explain:
1. What makes it suspicious.
2. What the user should NOT do.
3. What the user should do instead.

Common situations include:
- Fake UPI payment or collect requests
- QR-code and fake-refund scams
- Fake bank or customer-care impersonation
- Fake job, prize, or reward scams
- Remote-access or screen-sharing scams

Never ask the user for:
- UPI PIN
- OTP
- Passwords
- Card numbers
- CVV
- Bank account credentials
- Other sensitive financial information

Never tell the user to send money as a test.

Do not automatically claim something is definitely a scam when there is not enough evidence. Explain uncertainty and ask questions.

If the user says they may already have lost money, advise them to contact their bank or payment provider through an official channel and seek appropriate official fraud-reporting help in India.

Keep responses understandable and reasonably concise.

You are an awareness assistant, not a bank employee or official investigator.
`;

        const contents = history.map(item => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: item.content
                }
            ]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({
            reply: response.text
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            error: "The assistant could not process your message."
        });
    }
});

app.listen(PORT, () => {
    console.log(`UPI Safety Assistant running at http://localhost:${PORT}`);
});