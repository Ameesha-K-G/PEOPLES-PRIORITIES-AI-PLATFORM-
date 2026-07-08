import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize the Gemini API client safely per guidelines
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required in secrets");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // 1. Core API Route: AI Synthesis Engine Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text content is required" });
      }

      const ai = getAiClient();

      const systemInstruction = `You are the core AI Synthesis Engine for "People's Priorities," a multilingual AI platform designed for parliamentary constituency planning.
Your goal is to take unstructured, multi-channel citizen submissions (voice transcripts, text messages, or photo descriptions), standardize them, map their geographic parameters, and match them with authoritative datasets to compute an objective priority score.

Conform strictly to the following processing pipeline for every citizen input provided:

1. MULTILINGUAL TRANSLATION & SEMANTIC THEME CLUSTERING
- Detect the input language and translate regional languages/dialects into standard English.
- Classify the request into a standard Civic Theme. It MUST be exactly one of the following: "School Upgrades", "Water Supply", "Vocational Center", "Road Connectivity".
- Extract the core user request sentence.

2. GEOSPATIAL PARAMETER EXTRACTION
- Extract any named locations, village names, blocks, or landmarks mentioned in the text to assist in mapping geospatial hotspots. Return them in an array.

3. AUTOMATED DATA ENRICHMENT MATCHING
Identify the exact external dataset registry and primary planning metric needed to cross-reference this request, based on these operational rules:
- School Upgrades -> Educational Registry & Student Demographics (Metric: Travel Distance vs. Local Enrollment Rate)
- Water Supply -> Hydro-geological GIS & Water Grid Registry (Metric: Local Pipeline Gap Index)
- Vocational Center -> Employment & District Census Data (Metric: Youth Unemployment Density)
- Road Connectivity -> Satellite GIS Highway Infrastructure Maps (Metric: Isolated Village Distance Index)

- Set target_public_registry and synthesized_planning_metric_needed EXACTLY as specified in the rules.
- Set target_regional_risk_factor to a concise string outlining the regional risk (e.g. "Unsafe transport for female students", "Saline water intrusion in wells", "High youth migration rate due to skill gap", "Monsoon washout isolation").

4. SIMULATED PRIORITY SCORING METRICS
Generate estimated placeholder values (normalized between 0.0 and 1.0) to satisfy the platform's decision formula: 
Sp = ((Dh * Wd) + (Ig * Wi)) / Cp * Pd
Generate:
- demand_intensity_dh: Demand Hotspot Intensity based on recurring complaint frequency (0.0 to 1.0).
- infrastructure_gap_ig: Confirmed Infrastructure Supply Gap index (0.0 to 1.0).
- estimated_cost_cp: Estimated relative project expenditure cost (MUST be exactly 0.3 for Low, 0.6 for Medium, or 1.0 for High).
- socio_economic_disadvantage_pd: Socio-Economic Disadvantage multiplier where 1.0 is average, up to 1.5 for isolated regions (range: 1.0 to 1.5).

You must output strictly according to the requested JSON response schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.OBJECT,
                properties: {
                  detected_language: { type: Type.STRING },
                  standardized_english_transcript: { type: Type.STRING },
                  assigned_theme: { type: Type.STRING },
                  extracted_locations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "detected_language",
                  "standardized_english_transcript",
                  "assigned_theme",
                  "extracted_locations",
                ],
              },
              data_enrichment: {
                type: Type.OBJECT,
                properties: {
                  target_public_registry: { type: Type.STRING },
                  synthesized_planning_metric_needed: { type: Type.STRING },
                  target_regional_risk_factor: { type: Type.STRING },
                },
                required: [
                  "target_public_registry",
                  "synthesized_planning_metric_needed",
                  "target_regional_risk_factor",
                ],
              },
              simulated_scoring_inputs: {
                type: Type.OBJECT,
                properties: {
                  demand_intensity_dh: { type: Type.NUMBER },
                  infrastructure_gap_ig: { type: Type.NUMBER },
                  estimated_cost_cp: { type: Type.NUMBER },
                  socio_economic_disadvantage_pd: { type: Type.NUMBER },
                },
                required: [
                  "demand_intensity_dh",
                  "infrastructure_gap_ig",
                  "estimated_cost_cp",
                  "socio_economic_disadvantage_pd",
                ],
              },
            },
            required: ["analysis", "data_enrichment", "simulated_scoring_inputs"],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("No response text returned from Gemini API");
      }

      const parsedData = JSON.parse(jsonText.trim());
      return res.json(parsedData);
    } catch (error: any) {
      console.error("AI Synthesis Engine Error:", error);
      // Fallback response if GEMINI_API_KEY is not set or fails, so the user can still fully use the interface
      return res.status(500).json({
        error: error.message || "Failed to analyze text",
        isDemoFallback: true,
      });
    }
  });

  // 2. Serve static assets in production, mount Vite middleware in development
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
    console.log(`People's Priorities server running on http://localhost:${PORT}`);
  });
}

startServer();
