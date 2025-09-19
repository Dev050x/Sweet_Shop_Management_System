// test/sweet/restock.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";

// mock JWT for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "admin123", role: "ADMIN" })),
  },
  verify: vi.fn(() => ({ userId: "admin123", role: "ADMIN" })),
}));

// mock prisma
vi.mock("../../src/utils/prisma", () => ({
  prisma: {
    sweet: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// mock sweet service
vi.mock("../../src/services/sweet.service", () => ({
  restockSweet: vi.fn(),
}));


import jwt from "jsonwebtoken";

describe("Sweet Restock Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware (ADMIN role)
    (jwt.verify as Mock).mockReturnValue({ userId: "admin123", role: "ADMIN" });
  });

  const mockRestockedSweet = {
    id: 1,
    name: "Chocolate Bar",
    category: "CHOCOLATE",
    price: 10.99,
    quantity: 15, // increased from 10 after restocking 5
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

   // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should fail with invalid quantity (negative)", async () => {
      const res = await request(app)
        .post("/api/sweets/1/restock")
        .set("Authorization", validAdminToken)
        .send({
          quantity: -3, // Invalid negative quantity
        });

      expect(res.status).toBe(400);
    });

  });

  // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should call restockSweet service with correct parameters", async () => {
      (sweetService.restockSweet as Mock).mockResolvedValueOnce(mockRestockedSweet);

      const res = await request(app)
        .post("/api/sweets/123/restock")
        .set("Authorization", validAdminToken)
        .send({
          quantity: 10,
        });

      expect(sweetService.restockSweet).toHaveBeenCalledWith(123, 10);
      expect(sweetService.restockSweet).toHaveBeenCalledTimes(1);
    });

    it("should handle service layer errors", async () => {
      (sweetService.restockSweet as Mock).mockRejectedValueOnce(
        new Error("Sweet not found")
      );

      const res = await request(app)
        .post("/api/sweets/999/restock")
        .set("Authorization", validAdminToken)
        .send({
          quantity: 5,
        });

      expect(res.status).toBe(500);
    });
  });

   // ---------------- Controller tests ----------------
  describe("Controller", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should successfully restock sweet and return correct response", async () => {
      (sweetService.restockSweet as Mock).mockResolvedValueOnce(mockRestockedSweet);

      const res = await request(app)
        .post("/api/sweets/1/restock")
        .set("Authorization", validAdminToken)
        .send({
          quantity: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Sweet restocked successfully");
      expect(res.body.sweet).toMatchObject({
        id: 1,
        name: "Chocolate Bar",
        quantity: 15, // increased after restocking
      });
    });

    it("should return 500 for service errors", async () => {
      (sweetService.restockSweet as Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const res = await request(app)
        .post("/api/sweets/1/restock")
        .set("Authorization", validAdminToken)
        .send({
          quantity: 5,
        });

      expect(res.status).toBe(500);
    });
  });


});