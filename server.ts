import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const PROPERTIES_FILE = path.join(process.cwd(), "properties.json");

const DEFAULT_PROPERTIES = [
  {
    id: "prop-1",
    title: "Mansão Haras Residence",
    price: "R$ 4.500.000",
    type: "casa",
    location: "Vitória da Conquista - BA",
    description: "Residência cinematográfica com 4 suítes master, pé-direito duplo de 7 metros, área gourmet integrada com piscina aquecida de borda infinita e automação completa.",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

function readProperties() {
  try {
    if (!fs.existsSync(PROPERTIES_FILE)) {
      fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(DEFAULT_PROPERTIES, null, 2), "utf-8");
      return DEFAULT_PROPERTIES;
    }
    const data = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading properties file:", err);
    return DEFAULT_PROPERTIES;
  }
}

function writeProperties(properties: any[]) {
  try {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing properties file:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints
  app.get("/api/properties", (req, res) => {
    const props = readProperties();
    res.json(props);
  });

  app.post("/api/properties", (req, res) => {
    const props = req.body;
    if (Array.isArray(props)) {
      writeProperties(props);
      res.json({ success: true, count: props.length });
    } else {
      res.status(400).json({ error: "Invalid data format. Expected an array of properties." });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
