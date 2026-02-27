import express, { Request, Response, Express, NextFunction } from "express";
import cors from "cors";
import { z, ZodObject } from "zod";
import { prisma } from "./lib/prisma";

const app: Express = express();
app.use(cors());
app.use(express.json());

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    displayName: z.string().min(1).optional(),
  }),
});

const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    publicationDate: z.coerce.date().optional(),
    categories: z.array(z.coerce.number()).min(1),
  }),
});

const getAnnouncementsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categories: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const array = Array.isArray(val) ? val : [val];
        return array.map((v) => parseInt(v)).filter((v) => !isNaN(v));
      }),
  }),
});

const getAnnouncementSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
});

const updateAnnouncementSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    publicationDate: z.coerce.date().optional(),
    categories: z.array(z.coerce.number()).min(1).optional(),
  }),
});

const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request objects with validated and transformed data
      req.body = result.body;
      
      // Using defineProperty to override Express getters
      Object.defineProperty(req, "query", {
        value: result.query,
        configurable: true,
        enumerable: true,
      });
      Object.defineProperty(req, "params", {
        value: result.params,
        configurable: true,
        enumerable: true,
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.format(),
        });
      }
      return res.status(500).json({ error: "Internal server error during validation" });
    }
  };

app.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post(
  "/categories",
  validate(categorySchema),
  async (req: Request, res: Response) => {
    try {
      const { name, displayName } = req.body;
      const category = await prisma.category.create({
        data: { name, displayName: displayName || name },
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

app.get(
  "/announcements",
  validate(getAnnouncementsSchema),
  async (req: Request, res: Response) => {
    try {
      const { search, categories } = req.query as any;

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ];
      }

      if (categories && categories.length > 0) {
        where.categories = {
          some: {
            id: { in: categories },
          },
        };
      }

      const announcements = await prisma.announcement.findMany({
        where,
        include: { categories: true },
        orderBy: { lastUpdate: "desc" },
      });

      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  }
);

app.get(
  "/announcements/:id",
  validate(getAnnouncementSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as any;
      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: { categories: true },
      });

      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcement" });
    }
  }
);

app.post(
  "/announcements",
  validate(announcementSchema),
  async (req: Request, res: Response) => {
    try {
      const { title, content, categories, publicationDate } = req.body;
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          publicationDate,
          categories: {
            connect: categories.map((id: number) => ({ id })),
          },
        },
        include: { categories: true },
      });

      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to create announcement" });
    }
  }
);

app.patch(
  "/announcements/:id",
  validate(updateAnnouncementSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as any;
      const { title, content, categories, publicationDate } = req.body;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          title,
          content,
          publicationDate,
          categories: categories
            ? { set: categories.map((id: number) => ({ id })) }
            : undefined,
        },
        include: { categories: true },
      });

      res.json(announcement);
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Announcement not found" });
      }
      res.status(500).json({ error: "Failed to update announcement" });
    }
  }
);

const server = app.listen(8000, () => {
  console.log("started");
});

export { app, server };
