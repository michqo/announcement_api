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
    categories: z.array(z.nativeEnum(Category)).min(1),
  }),
});

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
};

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
      orderBy: { publicationDate: "desc" },
    });

    const formattedAnnouncements = announcements.map((a) => ({
      ...a,
      publicationDate: formatDate(a.publicationDate),
      lastUpdate: formatDate(a.lastUpdate),
    }));

    res.json(formattedAnnouncements);
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

      res.status(201).json({
        ...announcement,
        publicationDate: formatDate(announcement.publicationDate),
        lastUpdate: formatDate(announcement.lastUpdate),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  }
);

const server = app.listen(8000, () => {
  console.log("started");
});

export { app, server };
