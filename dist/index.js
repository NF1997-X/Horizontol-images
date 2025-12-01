var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  images: () => images,
  insertImageSchema: () => insertImageSchema,
  insertPageSchema: () => insertPageSchema,
  insertRowSchema: () => insertRowSchema,
  insertShareLinkSchema: () => insertShareLinkSchema,
  insertUserSchema: () => insertUserSchema,
  pages: () => pages,
  rows: () => rows,
  shareLinks: () => shareLinks,
  updateImageSchema: () => updateImageSchema,
  updatePageSchema: () => updatePageSchema,
  updateRowSchema: () => updateRowSchema,
  users: () => users
});
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
var updateImageSchema = insertImageSchema.partial();

// server/database.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
var sql2 = neon(process.env.DATABASE_URL);
var db = drizzle(sql2, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getAllPages() {
    return await db.select().from(pages).orderBy(pages.order);
  }
  async getPage(id) {
    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    return result[0];
  }
  async createPage(insertPage) {
    const allPages = await db.select().from(pages);
    const maxOrder = allPages.length > 0 ? Math.max(...allPages.map((p) => p.order)) : -1;
    const result = await db.insert(pages).values({
      name: insertPage.name,
      order: maxOrder + 1
    }).returning();
    return result[0];
  }
  async updatePage(id, pageUpdate) {
    const result = await db.update(pages).set(pageUpdate).where(eq(pages.id, id)).returning();
    return result[0];
  }
  async deletePage(id) {
    await db.delete(pages).where(eq(pages.id, id));
  }
  async getRowsByPage(pageId) {
    return await db.select().from(rows).where(eq(rows.pageId, pageId)).orderBy(rows.order);
  }
  async getRow(id) {
    const result = await db.select().from(rows).where(eq(rows.id, id)).limit(1);
    return result[0];
  }
  async createRow(insertRow) {
    const pageRows = await db.select().from(rows).where(eq(rows.pageId, insertRow.pageId));
    const maxOrder = pageRows.length > 0 ? Math.max(...pageRows.map((r) => r.order)) : -1;
    const result = await db.insert(rows).values({
      pageId: insertRow.pageId,
      title: insertRow.title,
      order: maxOrder + 1
    }).returning();
    return result[0];
  }
  async updateRow(id, rowUpdate) {
    const result = await db.update(rows).set(rowUpdate).where(eq(rows.id, id)).returning();
    return result[0];
  }
  async deleteRow(id) {
    await db.delete(rows).where(eq(rows.id, id));
  }
  async getImagesByRow(rowId) {
    return await db.select().from(images).where(eq(images.rowId, rowId)).orderBy(images.order);
  }
  async getImage(id) {
    const result = await db.select().from(images).where(eq(images.id, id)).limit(1);
    return result[0];
  }
  async createImage(insertImage) {
    const rowImages = await db.select().from(images).where(eq(images.rowId, insertImage.rowId));
    const maxOrder = rowImages.length > 0 ? Math.max(...rowImages.map((i) => i.order)) : -1;
    const result = await db.insert(images).values({
      rowId: insertImage.rowId,
      url: insertImage.url,
      title: insertImage.title,
      subtitle: insertImage.subtitle,
      order: maxOrder + 1
    }).returning();
    return result[0];
  }
  async updateImage(id, imageUpdate) {
    const result = await db.update(images).set(imageUpdate).where(eq(images.id, id)).returning();
    return result[0];
  }
  async deleteImage(id) {
    await db.delete(images).where(eq(images.id, id));
  }
  async getShareLinkByCode(shortCode) {
    const result = await db.select().from(shareLinks).where(eq(shareLinks.shortCode, shortCode)).limit(1);
    return result[0];
  }
  async getShareLinkByPageId(pageId) {
    const result = await db.select().from(shareLinks).where(eq(shareLinks.pageId, pageId)).limit(1);
    return result[0];
  }
  async createShareLink(insertShareLink) {
    const result = await db.insert(shareLinks).values({
      shortCode: insertShareLink.shortCode,
      pageId: insertShareLink.pageId
    }).returning();
    return result[0];
  }
};
var storage = new DatabaseStorage();

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
      console.log("POST /api/images - Request body:", req.body);
      const data = insertImageSchema.omit({ order: true }).parse(req.body);
      console.log("Parsed data:", data);
      const image = await storage.createImage(data);
      console.log("Created image:", image);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating image:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create image", details: String(error) });
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
      console.log("\u{1F4DD} Creating share link for pageId:", pageId);
      const page = await storage.getPage(pageId);
      if (!page) {
        console.error("\u274C Page not found:", pageId);
        return res.status(404).json({ error: "Page not found" });
      }
      const existingLink = await storage.getShareLinkByPageId(pageId);
      if (existingLink) {
        console.log("\u2705 Using existing share link:", existingLink.shortCode);
        return res.json(existingLink);
      }
      const shortCode = randomBytes(4).toString("hex");
      console.log("\u{1F511} Generated shortCode:", shortCode);
      const data = insertShareLinkSchema.parse({ shortCode, pageId });
      const shareLink = await storage.createShareLink(data);
      console.log("\u2705 Share link created successfully:", shareLink);
      res.status(201).json(shareLink);
    } catch (error) {
      console.error("\u274C Share link creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create share link" });
    }
  });
  app2.get("/api/share-links/:shortCode", async (req, res) => {
    try {
      const shortCode = req.params.shortCode;
      console.log("\u{1F50D} Looking up share link for shortCode:", shortCode);
      const shareLink = await storage.getShareLinkByCode(shortCode);
      if (!shareLink) {
        console.error("\u274C Share link not found:", shortCode);
        return res.status(404).json({ error: "Share link not found" });
      }
      console.log("\u2705 Share link found:", shareLink);
      res.json(shareLink);
    } catch (error) {
      console.error("\u274C Error fetching share link:", error);
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
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-hook-form"],
          "radix-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-popover",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-slot"
          ],
          "gallery": ["lightgallery", "lg-zoom", "lg-thumbnail"],
          "icons": ["lucide-react", "react-icons"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
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
