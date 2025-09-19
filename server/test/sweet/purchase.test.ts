// test/sweet/purchase.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";


// mock JWT for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
  },
}));

// mock prisma
vi.mock("../../src/utils/prisma", () => ({
  prisma: {
    sweet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    purchase: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));


// mock jwt for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
  },
}));



import jwt from "jsonwebtoken";

describe("Sweet Purchase Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware
    (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
  });

  const mockPurchasedSweet = {
    id: 1,
    name: "Chocolate Bar",
    category: "CHOCOLATE",
    price: 10.99,
    quantity: 8, // reduced from 10 after purchase of 2
    createdAt: new Date(),
    updatedAt: new Date(),
  };
    // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    const validToken = "Bearer valid.user.token";

    it("should fail with invalid quantity (negative)", async () => {
      const res = await request(app)
        .post("/api/sweets/1/purchase")
        .set("Authorization", validToken)
        .send({
          quantity: -1, // Invalid negative quantity
        });

      expect(res.status).toBe(400);
    });
  });

  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .post("/api/sweets/1/purchase")
        .send({
          quantity: 2,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });
  });



});