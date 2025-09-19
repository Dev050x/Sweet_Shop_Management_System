// test/auth/login.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";

describe("Auth Login Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    it("should fail if email invalid", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "not-an-email",
        password: "StrongP@ss1",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("invalid request body");
    });

    it("should fail if password too short", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "div@example.com",
        password: "123",
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });


});