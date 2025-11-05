// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  pages;
  rows;
  images;
  shareLinks;
  constructor() {
    this.pages = /* @__PURE__ */ new Map();
    this.rows = /* @__PURE__ */ new Map();
    this.images = /* @__PURE__ */ new Map();
    this.shareLinks = /* @__PURE__ */ new Map();
    const page1 = { id: randomUUID(), name: "Gallery 1", order: 0 };
    const page2 = { id: randomUUID(), name: "Gallery 2", order: 1 };
    this.pages.set(page1.id, page1);
    this.pages.set(page2.id, page2);
    const row1 = { id: randomUUID(), pageId: page1.id, title: "Nature Collection", order: 0 };
    const row2 = { id: randomUUID(), pageId: page1.id, title: "Urban Photography", order: 1 };
    const row3 = { id: randomUUID(), pageId: page2.id, title: "Abstract Art", order: 0 };
    this.rows.set(row1.id, row1);
    this.rows.set(row2.id, row2);
    this.rows.set(row3.id, row3);
    const sampleImages = [
      { rowId: row1.id, url: "https://picsum.photos/id/112/300/300", title: "Mountain View", subtitle: "Beautiful landscape", order: 0 },
      { rowId: row1.id, url: "https://picsum.photos/id/122/300/300", title: "Ocean Waves", subtitle: "Seascape", order: 1 },
      { rowId: row1.id, url: "https://picsum.photos/id/132/300/300", title: "Forest Path", subtitle: "Nature trail", order: 2 },
      { rowId: row1.id, url: "https://picsum.photos/id/142/300/300", title: "Desert Sunset", subtitle: "Golden hour", order: 3 },
      { rowId: row1.id, url: "https://picsum.photos/id/152/300/300", title: "River Flow", subtitle: "Waterscape", order: 4 },
      { rowId: row1.id, url: "https://picsum.photos/id/162/300/300", title: "Snow Peak", subtitle: "Winter scene", order: 5 },
      { rowId: row2.id, url: "https://picsum.photos/id/172/300/300", title: "City Lights", subtitle: "Night view", order: 0 },
      { rowId: row2.id, url: "https://picsum.photos/id/182/300/300", title: "Street Art", subtitle: "Graffiti", order: 1 },
      { rowId: row2.id, url: "https://picsum.photos/id/192/300/300", title: "Architecture", subtitle: "Modern building", order: 2 },
      { rowId: row2.id, url: "https://picsum.photos/id/1102/300/300", title: "Bridge", subtitle: "Infrastructure", order: 3 },
      { rowId: row3.id, url: "https://picsum.photos/id/103/300/300", title: "Color Splash", subtitle: "Abstract", order: 0 },
      { rowId: row3.id, url: "https://picsum.photos/id/113/300/300", title: "Geometric", subtitle: "Patterns", order: 1 },
      { rowId: row3.id, url: "https://picsum.photos/id/123/300/300", title: "Texture", subtitle: "Surface", order: 2 },
      { rowId: row3.id, url: "https://picsum.photos/id/133/300/300", title: "Gradient", subtitle: "Colors", order: 3 },
      { rowId: row3.id, url: "https://picsum.photos/id/143/300/300", title: "Shapes", subtitle: "Forms", order: 4 }
    ];
    sampleImages.forEach((img) => {
      const image = { id: randomUUID(), ...img };
      this.images.set(image.id, image);
    });
  }
  async getAllPages() {
    return Array.from(this.pages.values()).sort((a, b) => a.order - b.order);
  }
  async getPage(id) {
    return this.pages.get(id);
  }
  async createPage(insertPage) {
    const id = randomUUID();
    const allPages = Array.from(this.pages.values());
    const maxOrder = allPages.length > 0 ? Math.max(...allPages.map((p) => p.order)) : -1;
    const page = { id, name: insertPage.name, order: maxOrder + 1 };
    this.pages.set(id, page);
    return page;
  }
  async updatePage(id, pageUpdate) {
    const page = this.pages.get(id);
    if (!page) return void 0;
    const updated = { ...page, ...pageUpdate };
    this.pages.set(id, updated);
    return updated;
  }
  async deletePage(id) {
    this.pages.delete(id);
    const rowsToDelete = Array.from(this.rows.values()).filter((r) => r.pageId === id);
    rowsToDelete.forEach((row) => {
      this.rows.delete(row.id);
      const imagesToDelete = Array.from(this.images.values()).filter((i) => i.rowId === row.id);
      imagesToDelete.forEach((img) => this.images.delete(img.id));
    });
  }
  async getRowsByPage(pageId) {
    return Array.from(this.rows.values()).filter((r) => r.pageId === pageId).sort((a, b) => a.order - b.order);
  }
  async getRow(id) {
    return this.rows.get(id);
  }
  async createRow(insertRow) {
    const id = randomUUID();
    const pageRows = Array.from(this.rows.values()).filter((r) => r.pageId === insertRow.pageId);
    const maxOrder = pageRows.length > 0 ? Math.max(...pageRows.map((r) => r.order)) : -1;
    const row = { id, pageId: insertRow.pageId, title: insertRow.title, order: maxOrder + 1 };
    this.rows.set(id, row);
    return row;
  }
  async updateRow(id, rowUpdate) {
    const row = this.rows.get(id);
    if (!row) return void 0;
    const updated = { ...row, ...rowUpdate };
    this.rows.set(id, updated);
    return updated;
  }
  async deleteRow(id) {
    this.rows.delete(id);
    const imagesToDelete = Array.from(this.images.values()).filter((i) => i.rowId === id);
    imagesToDelete.forEach((img) => this.images.delete(img.id));
  }
  async getImagesByRow(rowId) {
    return Array.from(this.images.values()).filter((i) => i.rowId === rowId).sort((a, b) => a.order - b.order);
  }
  async getImage(id) {
    return this.images.get(id);
  }
  async createImage(insertImage) {
    const id = randomUUID();
    const rowImages = Array.from(this.images.values()).filter((i) => i.rowId === insertImage.rowId);
    const maxOrder = rowImages.length > 0 ? Math.max(...rowImages.map((i) => i.order)) : -1;
    const image = {
      id,
      rowId: insertImage.rowId,
      url: insertImage.url,
      title: insertImage.title,
      subtitle: insertImage.subtitle ?? null,
      order: maxOrder + 1
    };
    this.images.set(id, image);
    return image;
  }
  async updateImage(id, imageUpdate) {
    const image = this.images.get(id);
    if (!image) return void 0;
    const updated = { ...image, ...imageUpdate };
    this.images.set(id, updated);
    return updated;
  }
  async deleteImage(id) {
    this.images.delete(id);
  }
  async getShareLinkByCode(shortCode) {
    return Array.from(this.shareLinks.values()).find((link) => link.shortCode === shortCode);
  }
  async getShareLinkByPageId(pageId) {
    return Array.from(this.shareLinks.values()).find((link) => link.pageId === pageId);
  }
  async createShareLink(insertShareLink) {
    const id = randomUUID();
    const shareLink = {
      id,
      shortCode: insertShareLink.shortCode,
      pageId: insertShareLink.pageId,
      createdAt: Math.floor(Date.now() / 1e3)
    };
    this.shareLinks.set(id, shareLink);
    return shareLink;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0)
});
var rows = pgTable("rows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0)
});
var images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rowId: varchar("row_id").notNull().references(() => rows.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  order: integer("order").notNull().default(0)
});
var shareLinks = pgTable("share_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortCode: varchar("short_code", { length: 8 }).notNull().unique(),
  pageId: varchar("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull().default(sql`extract(epoch from now())`)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertPageSchema = createInsertSchema(pages).omit({ id: true });
var insertRowSchema = createInsertSchema(rows).omit({ id: true });
var insertImageSchema = createInsertSchema(images).omit({ id: true });
var insertShareLinkSchema = createInsertSchema(shareLinks).omit({ id: true, createdAt: true });
var updatePageSchema = insertPageSchema.partial().omit({ order: true });
var updateRowSchema = insertRowSchema.partial().pick({ title: true });
var updateImageSchema = insertImageSchema.partial().pick({ url: true, title: true, subtitle: true });

// server/routes.ts
import { z } from "zod";
import { randomBytes } from "crypto";
import multer from "multer";
import fs from "fs";
import path from "path";
async function registerRoutes(app2) {
  const uploadDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app2.use("/uploads", (await import("express")).default.static(uploadDir));
  const storageEngine = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${safeBase || "image"}-${unique}${ext}`);
    }
  });
  const upload = multer({
    storage: storageEngine,
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image uploads are allowed"));
    },
    limits: { fileSize: 10 * 1024 * 1024 }
    // 10MB
  });
  app2.get("/api/pages", async (req, res) => {
    try {
      const pages2 = await storage.getAllPages();
      res.json(pages2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });
  app2.get("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });
  app2.post("/api/pages", async (req, res) => {
    try {
      const data = insertPageSchema.omit({ order: true }).parse(req.body);
      const page = await storage.createPage(data);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create page" });
    }
  });
  app2.patch("/api/pages/:id", async (req, res) => {
    try {
      const data = updatePageSchema.parse(req.body);
      const page = await storage.updatePage(req.params.id, data);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update page" });
    }
  });
  app2.delete("/api/pages/:id", async (req, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });
  app2.get("/api/pages/:pageId/rows", async (req, res) => {
    try {
      const rows2 = await storage.getRowsByPage(req.params.pageId);
      res.json(rows2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rows" });
    }
  });
  app2.get("/api/rows/:id", async (req, res) => {
    try {
      const row = await storage.getRow(req.params.id);
      if (!row) {
        return res.status(404).json({ error: "Row not found" });
      }
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch row" });
    }
  });
  app2.post("/api/rows", async (req, res) => {
    try {
      const data = insertRowSchema.omit({ order: true }).parse(req.body);
      const row = await storage.createRow(data);
      res.status(201).json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create row" });
    }
  });
  app2.patch("/api/rows/:id", async (req, res) => {
    try {
      const data = updateRowSchema.parse(req.body);
      const row = await storage.updateRow(req.params.id, data);
      if (!row) {
        return res.status(404).json({ error: "Row not found" });
      }
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update row" });
    }
  });
  app2.delete("/api/rows/:id", async (req, res) => {
    try {
      await storage.deleteRow(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete row" });
    }
  });
  app2.get("/api/rows/:rowId/images", async (req, res) => {
    try {
      const images2 = await storage.getImagesByRow(req.params.rowId);
      res.json(images2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });
  app2.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });
  app2.post("/api/images", async (req, res) => {
    try {
      const data = insertImageSchema.omit({ order: true }).parse(req.body);
      const image = await storage.createImage(data);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create image" });
    }
  });
  app2.patch("/api/images/:id", async (req, res) => {
    try {
      const data = updateImageSchema.parse(req.body);
      const image = await storage.updateImage(req.params.id, data);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update image" });
    }
  });
  app2.delete("/api/images/:id", async (req, res) => {
    try {
      await storage.deleteImage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  });
  app2.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const relativeUrl = `/uploads/${req.file.filename}`;
      return res.status(201).json({
        url: relativeUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      return res.status(500).json({ error: error?.message || "Failed to upload image" });
    }
  });
  app2.post("/api/share-links/:pageId", async (req, res) => {
    try {
      const pageId = req.params.pageId;
      const page = await storage.getPage(pageId);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      const existingLink = await storage.getShareLinkByPageId(pageId);
      if (existingLink) {
        return res.json(existingLink);
      }
      const shortCode = randomBytes(4).toString("hex");
      const data = insertShareLinkSchema.parse({ shortCode, pageId });
      const shareLink = await storage.createShareLink(data);
      res.status(201).json(shareLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create share link" });
    }
  });
  app2.get("/api/share-links/:shortCode", async (req, res) => {
    try {
      const shareLink = await storage.getShareLinkByCode(req.params.shortCode);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      res.json(shareLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch share link" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
