import express, { Request, Response, Express, NextFunction } from "express";
import cors from "cors";
import { z, ZodObject } from "zod";
import { prisma } from "./lib/prisma";
import { Category } from "@prisma/client";

const app: Express = express();
app.use(cors());
app.use(express.json());

const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    categories: z
      .array(z.enum(Object.values(Category) as [string, ...string[]]))
      .min(1),
  }),
});

const updateAnnouncementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    publicationDate: z.coerce.date().optional(),
    categories: z
      .array(z.enum(Object.values(Category) as [string, ...string[]]))
      .min(1)
      .optional(),
  }),
});

const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

app.get("/announcements", async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { lastUpdate: "desc" },
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

app.post(
  "/announcements",
  validate(announcementSchema),
  async (req: Request, res: Response) => {
    try {
      const { title, content, categories } = req.body;
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          categories,
        },
      });

      res.status(201).json(announcement);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  }
);

app.patch(
  "/announcements/:id",
  validate(updateAnnouncementSchema),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { title, content, categories, publicationDate } = req.body;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          title,
          content,
          categories,
          publicationDate,
        },
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
