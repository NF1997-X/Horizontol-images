import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertPageSchema, insertRowSchema, insertImageSchema, updatePageSchema, updateRowSchema, updateImageSchema, insertShareLinkSchema } from "../shared/schema.js";
import { z } from "zod";
import { randomBytes } from "crypto";
import multer from "multer";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static serving for uploaded files
  const uploadDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", (await import("express")).default.static(uploadDir));

  // Configure multer storage for image uploads
  const storageEngine = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, uploadDir);
    },
    filename: (_req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${safeBase || "image"}-${unique}${ext}`);
    },
  });
  const upload = multer({
    storage: storageEngine,
    fileFilter: (_req: any, file: any, cb: any) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image uploads are allowed"));
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // Pages routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
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

  app.post("/api/pages", async (req, res) => {
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

  app.patch("/api/pages/:id", async (req, res) => {
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

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Rows routes
  app.get("/api/pages/:pageId/rows", async (req, res) => {
    try {
      const rows = await storage.getRowsByPage(req.params.pageId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rows" });
    }
  });

  app.get("/api/rows/:id", async (req, res) => {
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

  app.post("/api/rows", async (req, res) => {
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

  app.patch("/api/rows/:id", async (req, res) => {
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

  app.delete("/api/rows/:id", async (req, res) => {
    try {
      await storage.deleteRow(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete row" });
    }
  });

  // Images routes
  app.get("/api/rows/:rowId/images", async (req, res) => {
    try {
      const images = await storage.getImagesByRow(req.params.rowId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
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

  app.post("/api/images", async (req, res) => {
    try {
      console.log('POST /api/images - Request body:', req.body);
      const data = insertImageSchema.omit({ order: true }).parse(req.body);
      console.log('Parsed data:', data);
      const image = await storage.createImage(data);
      console.log('Created image:', image);
      res.status(201).json(image);
    } catch (error) {
      console.error('Error creating image:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create image", details: String(error) });
    }
  });

  app.patch("/api/images/:id", async (req, res) => {
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

  app.delete("/api/images/:id", async (req, res) => {
    try {
      await storage.deleteImage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Upload route for image files
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
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
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || "Failed to upload image" });
    }
  });

  // Share Links routes
  app.post("/api/share-links/:pageId", async (req, res) => {
    try {
      const pageId = req.params.pageId;
      console.log('📝 Creating share link for pageId:', pageId);
      
      // Check if page exists
      const page = await storage.getPage(pageId);
      if (!page) {
        console.error('❌ Page not found:', pageId);
        return res.status(404).json({ error: "Page not found" });
      }

      // Check if share link already exists for this page
      const existingLink = await storage.getShareLinkByPageId(pageId);
      if (existingLink) {
        console.log('✅ Using existing share link:', existingLink.shortCode);
        return res.json(existingLink);
      }

      // Generate short code (8 characters)
      const shortCode = randomBytes(4).toString('hex');
      console.log('🔑 Generated shortCode:', shortCode);
      const data = insertShareLinkSchema.parse({ shortCode, pageId });
      const shareLink = await storage.createShareLink(data);
      console.log('✅ Share link created successfully:', shareLink);
      res.status(201).json(shareLink);
    } catch (error) {
      console.error('❌ Share link creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  app.get("/api/share-links/:shortCode", async (req, res) => {
    try {
      const shortCode = req.params.shortCode;
      console.log('🔍 Looking up share link for shortCode:', shortCode);
      const shareLink = await storage.getShareLinkByCode(shortCode);
      if (!shareLink) {
        console.error('❌ Share link not found:', shortCode);
        return res.status(404).json({ error: "Share link not found" });
      }
      console.log('✅ Share link found:', shareLink);
      res.json(shareLink);
    } catch (error) {
      console.error('❌ Error fetching share link:', error);
      res.status(500).json({ error: "Failed to fetch share link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
