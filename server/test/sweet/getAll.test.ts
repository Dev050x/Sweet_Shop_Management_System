// test/sweet/getAll.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";
import { SweetCategory } from "@prisma/client";

// mock JWT for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
  },
  verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
}));



import { prisma } from "../../src/utils/prisma";
import jwt from "jsonwebtoken";

describe("Get All Sweets Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware
    (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
  });

  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .get("/api/sweets");
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });

    it("should fail with invalid JWT token", async () => {
      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", "Bearer invalid.jwt.token");
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });
  
});