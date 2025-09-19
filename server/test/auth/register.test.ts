// test/auth.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import { prisma } from "../../src/utils/prisma";
import * as service from "../../src/services/auth.service";
import bcrypt from "bcryptjs";

// mock bcrypt
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(() => Promise.resolve("hashedPass")) }
}));

// mock prisma inside service
vi.mock("../../src/utils/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

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

    it("should hash password and create user", async () => {
      // Set up mocks separately
      (prisma.user.findUnique as Mock).mockResolvedValueOnce(null);
      (prisma.user.create as Mock).mockResolvedValueOnce({ id: "2", name: "Div", email: "div@example.com", role: "USER" });

      const user = await service.registerUser("Div", "div@example.com", "StrongP@ss1");
      expect(bcrypt.hash).toHaveBeenCalledWith("StrongP@ss1", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: "Div", email: "div@example.com", password: "hashedPass" }
      });
      expect(user.email).toBe("div@example.com");
    });

    it("should throw error if email already exists", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({ id: "1", email: "div@example.com" });
      await expect(service.registerUser("Div", "div@example.com", "StrongP@ss1"))
        .rejects.toThrow("Email already registered");
    });

  });

  describe("Controller + middleware", () => {
    it("should register successfully", async () => {
      // Set up mocks separately
      (prisma.user.findUnique as Mock).mockResolvedValueOnce(null);
      (prisma.user.create as Mock).mockResolvedValueOnce({ id: "2", name: "Div", email: "div@example.com", role: "USER" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Div",
        email: "div@example.com",
        password: "StrongP@ss1"
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        id: "2",
        name: "Div",
        email: "div@example.com",
        role: "USER"
      });
    });

    it("should return 409 if duplicate email", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({ id: "2", email: "div@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Div",
        email: "div@example.com",
        password: "StrongP@ss1"
      });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already registered");
    });

    it("should return 500 for unexpected errors", async () => {
      (prisma.user.findUnique as Mock).mockImplementationOnce(() => { throw new Error("DB crashed"); });

      const res = await request(app).post("/api/auth/register").send({
        name: "Div",
        email: "div@example.com",
        password: "StrongP@ss1"
      });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("internal server error");
    });
  });


});