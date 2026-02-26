import supertest from "supertest";
import { app, server } from "../server";

const request = supertest(app);

describe("Test endpoint", () => {
  it("hello", async () => {
    const response = await request.get("/hello/John").send();

    expect(response.body).toBeInstanceOf(Object);
    expect(response.status).toBe(200);
  });
});

afterAll(async () => {
  server.close();
});
