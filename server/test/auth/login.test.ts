// test/auth/login.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as service from "../../src/services/auth.service";
import { prisma } from "../../src/utils/prisma";


// mock bcrypt with BOTH default and named exports
vi.mock("bcryptjs", () => ({
  default: { 
    compare: vi.fn(() => Promise.resolve(true)),
    hash: vi.fn(() => Promise.resolve("hashedPass")) 
  },
  compare: vi.fn(() => Promise.resolve(true)), // for named import
}));

// mock prisma
vi.mock("../../src/utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import bcrypt from "bcryptjs";

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

  // ---------------- Service layer ----------------
  describe("Service layer", () => {
    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce(null);
      await expect(service.loginUser("div@example.com", "StrongP@ss1"))
        .rejects.toThrow("User not found");
    });

    it("should throw error if password does not match", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({
        id: "1",
        email: "div@example.com",
        password: "hashedPass",
        role: "USER",
      });
      (bcrypt.compare as Mock).mockResolvedValueOnce(false);

      await expect(service.loginUser("div@example.com", "wrongPass"))
        .rejects.toThrow("wrong password");
    });
  });



});