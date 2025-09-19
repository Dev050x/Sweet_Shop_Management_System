// test/auth.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import { prisma } from "../../src/utils/prisma";
import * as service from "../../src/services/auth.service";

describe("Auth Registration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Schema validation", () => {

    it("should fail if email invalid", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Div",
        email: "not-an-email",
        password: "StrongP@ss1"
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("invalid request body");
    });

    it("should fail if password weak", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Div",
        email: "div@example.com",
        password: "weakpass"
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail if name too short", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "D",
        email: "div@example.com",
        password: "StrongP@ss1"
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

  });


  describe("Service layer", () => {

    it("should throw error if email already exists", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({ id: "1", email: "div@example.com" });
      await expect(service.registerUser("Div", "div@example.com", "StrongP@ss1"))
        .rejects.toThrow("Email already registered");
    });

  });


});