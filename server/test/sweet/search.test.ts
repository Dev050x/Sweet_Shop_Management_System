// test/sweet/search.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";

// mock JWT for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
  },
  verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
}));


// mock sweet service
vi.mock("../../src/services/sweet.service", () => ({
  searchSweets: vi.fn(),
}));

import jwt from "jsonwebtoken";

describe("Sweet Search Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware
    (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
  });


  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .get("/api/sweets/search?name=chocolate");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });

    it("should fail with invalid JWT token", async () => {
      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/api/sweets/search?name=chocolate")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });

});