import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper function to lazily instantiate Gemini API client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Multi-Turn Chat Assistant Endpoint (using gemini-3.5-flash)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid or missing messages array." });
    }

    const ai = getGenAI();

    // Transform client history into GenAI contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          `You are Prisha Enterprises' official AI Diagnostics & Support Assistant in Horamavu, Bengaluru. 
Your goal is to provide warm, expert, accurate guidance to customers.
Key details about Prisha Enterprises:
- Location: 27, Hoysala Nagar, Horamavu, Bengaluru 560016 (Near Horamavu Main Road / Ramamurthy Nagar).
- Phone & WhatsApp: +91 99004 42171
- Ratings: 4.8 Stars on Google with 38 verified reviews!
- Core Services: Screen replacement in 1–2 hours, Gorilla Glass, Tempered Glass, Bulletproof Screen Guards, Matte Finish Protectors, Custom Phone Skins & Wraps, Charging Port Repairs, Battery Replacement, Water Damage Recovery.
- Store Hours: Mon–Fri 9:00 AM – 9:00 PM, Sat 10:00 AM – 10:00 PM, Sun Closed.
- Special Perk: FREE Doorstep Pick-up & Delivery in Horamavu & surrounding areas with zero hidden platform charges!
Always sound friendly, professional, knowledgeable, and helpful. Format your responses with clear markdown lists or bold key highlights when appropriate.`,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "Failed to process chat query" });
  }
});

// 2. High-Thinking Deep Diagnostic Estimator Endpoint (using gemini-3.1-pro-preview with ThinkingLevel.HIGH)
app.post("/api/diagnose", async (req, res) => {
  try {
    const { deviceModel, issueCategory, details } = req.body;
    if (!deviceModel || !issueCategory) {
      return res.status(400).json({ error: "Please provide both device model and issue category." });
    }

    const ai = getGenAI();

    const prompt = `Perform a deep technical diagnosis for the following device repair request:
- Device Model: ${deviceModel}
- Issue Category: ${issueCategory}
- Customer Notes / Symptoms: ${details || "Standard fault reported"}

Provide a comprehensive, high-reasoning breakdown with:
1. Fault Analysis (Likely component failure & root cause)
2. Recommended Solution at Prisha Enterprises
3. Estimated Repair Duration (Express repair time in hours)
4. Estimated Price Range in INR (₹)
5. Maintenance & Protection Advice after repair (e.g., bulletproof screen guard recommendation)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction:
          "You are Prisha Enterprises' Lead Hardware Diagnostic Specialist in Bengaluru. You combine electrical engineering expertise with deep smartphone teardown knowledge. Provide clear, highly trustworthy, structured technical diagnostic reports.",
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/diagnose:", error);
    res.status(500).json({ error: error?.message || "Failed to execute deep reasoning diagnosis" });
  }
});

// 3. High-Quality Image Generator Endpoint (using gemini-3.1-flash-image with imageSize 1K, 2K, 4K affordances)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, size, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required for image generation." });
    }

    const ai = getGenAI();

    // Size affordance validation: 1K, 2K, 4K
    const imageSize = ["1K", "2K", "4K", "512px"].includes(size) ? size : "1K";
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const aspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    const fullPrompt = `Photorealistic high-resolution product mockup of a custom phone skin, smartphone protective case, or wallpaper artwork: ${prompt}. Clean studio background, premium finish, crisp textures.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspect,
          imageSize: imageSize,
        },
      },
    });

    let imageUrl = null;
    let textOutput = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "The AI model did not return image data. Please try a different prompt." });
    }

    res.json({ imageUrl, description: textOutput, size: imageSize, aspectRatio: aspect });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({ error: error?.message || "Failed to generate skin image preview" });
  }
});

// Vite Middleware & Production Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
