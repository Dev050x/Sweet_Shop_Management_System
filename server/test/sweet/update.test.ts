// test/sweet/update.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";

// mock JWT for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "admin123", role: "ADMIN" })),
  },
  verify: vi.fn(() => ({ userId: "admin123", role: "ADMIN" })),
}));


import jwt from "jsonwebtoken";

describe("Sweet Update Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware (ADMIN role)
    (jwt.verify as Mock).mockReturnValue({ userId: "admin123", role: "ADMIN" });
  });

  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware for admin", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .put("/api/sweets/1")
        .send({
          name: "Updated Sweet",
          quantity: 5,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });

    it("should fail with invalid JWT token", async () => {
      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", "Bearer invalid.jwt.token")
        .send({
          name: "Updated Sweet",
          quantity: 5,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });

  // ---------------- Admin authorization tests ----------------
  describe("Admin authorization", () => {
    it("should fail when user is not admin", async () => {
      (jwt.verify as Mock).mockReturnValueOnce({ userId: "user123", role: "USER" });

      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", "Bearer user.token")
        .send({
          name: "Updated Sweet",
          quantity: 5,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Admins only");
    });

    it("should pass when user is admin", async () => {
      (jwt.verify as Mock).mockReturnValueOnce({ userId: "admin123", role: "ADMIN" });
      (sweetService.updateSweet as Mock).mockResolvedValueOnce(mockUpdatedSweet);

      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", "Bearer admin.token")
        .send({
          name: "Updated Sweet",
          quantity: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });



});