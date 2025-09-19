// test/sweet/restock.test.ts
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

describe("Sweet Restock Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware (ADMIN role)
    (jwt.verify as Mock).mockReturnValue({ userId: "admin123", role: "ADMIN" });
  });

  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .post("/api/sweets/1/restock")
        .send({
          quantity: 5,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });

    it("should fail when user is not admin", async () => {
      (jwt.verify as Mock).mockReturnValueOnce({ userId: "user123", role: "USER" });

      const res = await request(app)
        .post("/api/sweets/1/restock")
        .set("Authorization", "Bearer user.token")
        .send({
          quantity: 5,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Admins only");
    });
    
  });

});