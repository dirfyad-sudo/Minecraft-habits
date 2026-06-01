import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Ensure Gemini Client is initialized lazy/safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. AI features will fallback to client-safe mock algorithms.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// API ROUTES FIRST

// 1. Smart Task Breakdown (AI)
app.post("/api/ai/breakdown", async (req, res) => {
  const { title, priority, difficulty } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Return high quality local mock steps tailored for Minecraft style if API Key is missing
    return res.json({
      subtasks: [
        { title: "Gather resource materials for complete setup", completed: false },
        { title: "Draft rough outline of steps in the crafting table", completed: false },
        { title: "Execute phase 1 with focused attention", completed: false },
        { title: "Formulate second tier additions", completed: false },
        { title: "Review final build quality and polish blocks", completed: false }
      ]
    });
  }

  try {
    const ai = getGenAI();
    const prompt = `Break down the following task name: "${title}" (Priority Level: ${priority || "medium"}, Estimated Difficulty: ${difficulty || "normal"}). 
Provide a list of exactly 4 to 6 blocky, actionable subtasks/milestones to complete this topic from start to finish.
Act like a seasoned Minecraft craftsman dividing a giant build into small blocks. Give output in strict JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Descriptive name of the step in Indonesian/English" },
                  completed: { type: Type.BOOLEAN, description: "Always false" }
                },
                required: ["title", "completed"]
              }
            }
          },
          required: ["subtasks"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("AI breakdown error:", err);
    res.status(500).json({ error: err.message || "Failed to breakdown task" });
  }
});

// 2. AI Productivity Coach & Study Assistant
app.post("/api/ai/coach", async (req, res) => {
  const { message, userXP, userLevel, recentHabitStats, activeTopic } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.json({
      reply: `[MOCK Miner-Coach] Halo Petualang! Level-mu ${userLevel || 1} dengan XP ${userXP || 0}. 
Fokuslah memotong kayu tugas harian satu-per-satu hari ini. Ingat pesan steve: Phantoms akan muncul jika kamu tidak istirahat dan tidur tepat waktu! Jaga stamina bar-mu agar terus hijau!`
    });
  }

  try {
    const ai = getGenAI();
    const prompt = `You are the "Steve-Coach", a wise, supportive, and seasoned Minecraft craftsman and wizard productivity coach.
The user is asking you for help, advice or explanations. Here is their state:
- Level: ${userLevel || 1} (XP: ${userXP || 0})
- Habit tracking details: ${recentHabitStats || "Consistent effort"}
- Active focus topic: ${activeTopic || "General productivity"}

User Message: "${message || "Bagaimana cara agar tetap fokus?"}"

Respond with an engaging, short paragraph (under 120 words). Use creative Minecraft metaphors (e.g., redstone planning, inventory management, building fortress against creepers, saving hunger bars, sleeping to avoid Phantoms, mining diamond ideas). Mix Indonesian and basic friendly Minecraft lore. Keep formatting clean and encouraging!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("AI coach error:", err);
    res.status(500).json({ error: err.message || "Failed to contact AI Coach" });
  }
});

// 3. AI Roadmap Generator
app.post("/api/ai/roadmap", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Roadmap topic is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.json({
      title: `Peta Jalan: ${topic}`,
      target: topic,
      steps: [
        `🔨 Persiapan Block: Pelajari fundamental dasar dari ${topic}`,
        `🌿 Menanam Benih: Buat project eksperimental kecil yang relevan`,
        `🧱 Konstruksi Struktur: Perdalam materi tingkat lanjut dan implementasikan fitur utama`,
        `💎 Menambang Diamond: Optimasi performa dan lakukan debugging mendalam`,
        `🐉 Mengalahkan Ender Dragon: Luncurkan karya perdana mu ke publik!`
      ]
    });
  }

  try {
    const ai = getGenAI();
    const prompt = `Create a custom, gamified study roadmap for learning this topic: "${topic}".
Design exactly 5 sequential learning phases labeled as classical Minecraft milestones starting from punches-trees to defeating-the-dragon. 
Format each phase with a beautiful Minecraft emoji icon and clear subtitle in Indonesian or English.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            target: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "target", "steps"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Roadmap error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. AI Habit Recommendations & Schedule Optimization
app.post("/api/ai/habits-rec", async (req, res) => {
  const { lifeAreas } = req.body; // e.g. ["Belajar", "Kesehatan", "Finansial"]

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.json([
      { title: "Tidur Siang Cepat (Kesehatan)", description: "Isi ulang health heart untuk mencegah phantoms di malam hari.", category: "Kesehatan" },
      { title: "Redstone Budgeting (Keuangan)", description: "Catat setiap pengeluaran gold ingot agar tidak bangkrut.", category: "Keuangan" },
      { title: "Mining Pengetahuan (Belajar)", description: "Baca buku minimal 15 menit di enchantment table mu.", category: "Belajar" }
    ]);
  }

  try {
    const ai = getGenAI();
    const prompt = `Recommend exactly 3 custom premium habits for the user based on these focus life areas: ${JSON.stringify(lifeAreas || ["Belajar", "Kesehatan"])}.
Formulate them with exciting Minecraft naming lore.
Return in strict JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Exciting blocky short title" },
              description: { type: Type.STRING, description: "A highly motivational description involving Minecraft analogies in Indonesian" },
              category: { type: Type.STRING, description: "The corresponding area name" }
            },
            required: ["title", "description", "category"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (err: any) {
    console.error("AI Habit suggestions error:", err);
    res.json([
      { title: "Mining Pengetahuan", description: "Buka buku and baca 15 menit di samping perpustakaan mini.", category: "Belajar" }
    ]);
  }
});

// 5. AI Productivity Score and Weekly Review
app.post("/api/ai/weekly-review", async (req, res) => {
  const { completedTodosCount, completedHabitsCount, activeStreak, focusedMinutes } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.json({
      score: "A",
      title: "Gold Sword Master",
      evaluation: "Sangat baik! Kamu berhasil menjaga streak dan menambang banyak pencapaian minggu ini. Teruskan petualanganmu, Steve!"
    });
  }

  try {
    const ai = getGenAI();
    const prompt = `Synthesize a weekly productivity report card.
User statistics:
- Tasks Completed: ${completedTodosCount || 0}
- Habit reps checked: ${completedHabitsCount || 0}
- Active Streak: ${activeStreak || 0} days
- Deep focus: ${focusedMinutes || 0} minutes

Generate a productivity tier score (e.g. 'Diamond Tier', 'Netherite Tier', 'Redstone Tier', 'Iron Tier', 'Stone Tier', 'Wooden Tier') and a letter score (A, B, C, D, or S). Provide a playful, supportive review evaluation paragraph focusing on how they can improve like a Minecraft adventurer improving their gears. Return in JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.STRING, description: "Letter grade A, B, C, or S" },
            title: { type: Type.STRING, description: "Custom blocky title tier" },
            evaluation: { type: Type.STRING, description: "Short motivational feedback in Indonesian" }
          },
          required: ["score", "title", "evaluation"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("AI Weekly review error:", err);
    res.status(500).json({ error: "Failed to generate AI weekly report" });
  }
});

// VITE MIDDLEWARE SETUP FOR DEV/PRODUCTION
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
    console.log(`Minecraft Server launched on http://0.0.0.0:${PORT}`);
  });
}

startServer();
