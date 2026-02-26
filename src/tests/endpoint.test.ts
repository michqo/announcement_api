import supertest from "supertest";
import { app, server } from "../server";
import { prisma } from "../lib/prisma";

const request = supertest(app);

describe("Announcement API", () => {
  let announcementId: number;
  let categoryId: number;

  beforeAll(async () => {
    await prisma.announcement.deleteMany();
    await prisma.category.deleteMany();
    
    // Seed a category
    const cat = await prisma.category.create({ data: { name: "TestCategory" } });
    categoryId = cat.id;
  });

  afterAll(async () => {
    await prisma.announcement.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
    server.close();
  });

  it("POST /announcements - should create a new announcement", async () => {
    const response = await request.post("/announcements").send({
      title: "Test Announcement",
      content: "This is a test content",
      categories: [categoryId],
    });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Announcement");
    expect(response.body.categories[0].id).toBe(categoryId);
    announcementId = response.body.id;
  });

  it("GET /announcements - should list all announcements", async () => {
    const response = await request.get("/announcements");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toBe("Test Announcement");
  });

  it("GET /announcements/:id - should get a single announcement", async () => {
    const response = await request.get(`/announcements/${announcementId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(announcementId);
    expect(response.body.title).toBe("Test Announcement");
  });

  it("PATCH /announcements/:id - should update an announcement", async () => {
    const response = await request.patch(`/announcements/${announcementId}`).send({
      title: "Updated Title",
    });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
  });

  it("POST /announcements - should fail with non-array categories", async () => {
    const response = await request.post("/announcements").send({
      title: "Invalid",
      content: "Invalid",
      categories: "not-an-array",
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
