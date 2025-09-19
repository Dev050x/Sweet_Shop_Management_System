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

// mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mocked.jwt.token"),
    verify: vi.fn(() => ({ userId: "2", role: "USER" })),
  },
  sign: vi.fn(() => "mocked.jwt.token"), // for named import
  verify: vi.fn(() => ({ userId: "2", role: "USER" })), // for named import
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
import jwt from "jsonwebtoken";

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

    it("should return jwt token on valid credentials", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({
        id: "1",
        email: "div@example.com",
        password: "hashedPass",
        role: "USER",
      });
      (bcrypt.compare as Mock).mockResolvedValueOnce(true);
      (jwt.sign as Mock).mockReturnValueOnce("valid.jwt.token");

      const token = await service.loginUser("div@example.com", "StrongP@ss1");
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "1", role: "USER" },
        expect.any(String),
        { expiresIn: "1d" }
      );
      expect(token).toBe("valid.jwt.token");
    });

  });

  // ---------------- Controller + middleware ----------------
  describe("Controller + middleware", () => {
    it("should login successfully", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({
        id: "2",
        email: "div@example.com",
        password: "hashedPass",
        role: "USER",
      });
      (bcrypt.compare as Mock).mockResolvedValueOnce(true);
      (jwt.sign as Mock).mockReturnValueOnce("controller.jwt.token");

      const res = await request(app).post("/api/auth/login").send({
        email: "div@example.com",
        password: "StrongP@ss1",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.token).toBe("controller.jwt.token");
    });

    it("should return 400 for schema errors", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "invalid",
        password: "123",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("invalid request body");
    });

    it("should return 401 for when user not found", async () => {
      // Mock user not found scenario
      (prisma.user.findUnique as Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "div@example.com",
        password: "StrongP@ss1",
      });
      console.log(res.body);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 500 for unexpected errors", async () => {
      (prisma.user.findUnique as Mock).mockImplementationOnce(() => {
        throw new Error("DB crashed");
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "div@example.com",
        password: "StrongP@ss1",
      });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("internal server error");
    });
  });


});