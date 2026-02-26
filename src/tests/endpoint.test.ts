import supertest from "supertest";
import { app, server } from "../server";
import { prisma } from "../lib/prisma";

const request = supertest(app);

describe("Announcement API", () => {
  let announcementId: number;

  beforeAll(async () => {
    await prisma.announcement.deleteMany();
  });

  afterAll(async () => {
    await prisma.announcement.deleteMany();
    await prisma.$disconnect();
    server.close();
  });

  it("POST /announcements - should create a new announcement", async () => {
    const response = await request.post("/announcements").send({
      title: "Test Announcement",
      content: "This is a test content",
      categories: ["CITY", "COMMUNITY_EVENTS"],
    });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Announcement");
    expect(response.body.categories).toContain("CITY");
    announcementId = response.body.id;
  });

  it("GET /announcements - should list all announcements", async () => {
    const response = await request.get("/announcements");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toBe("Test Announcement");
  });

  it("PATCH /announcements/:id - should update an announcement", async () => {
    const response = await request.patch(`/announcements/${announcementId}`).send({
      title: "Updated Title",
      categories: ["HEALTH"],
    });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
    expect(response.body.categories).toEqual(["HEALTH"]);
  });

  it("PATCH /announcements/:id - should update publication date", async () => {
    const newDate = new Date("2026-12-25T10:00:00Z").toISOString();
    const response = await request.patch(`/announcements/${announcementId}`).send({
      publicationDate: newDate,
    });

    expect(response.status).toBe(200);
    expect(new Date(response.body.publicationDate).toISOString()).toBe(newDate);
  });

  it("POST /announcements - should fail with invalid categories", async () => {
    const response = await request.post("/announcements").send({
      title: "Invalid",
      content: "Invalid",
      categories: ["INVALID_CATEGORY"],
    });

    expect(response.status).toBe(400);
  });

  it("PATCH /announcements/:id - should return 404 for non-existent id", async () => {
    const response = await request.patch("/announcements/99999").send({
      title: "NotFound",
    });

    expect(response.status).toBe(404);
  });
});
