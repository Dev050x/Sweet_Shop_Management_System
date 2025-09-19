// test/sweet/update.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";
import { SweetCategory } from "@prisma/client";

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
  updateSweet: vi.fn(),
}));

import jwt from "jsonwebtoken";

describe("Sweet Update Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware (ADMIN role)
    (jwt.verify as Mock).mockReturnValue({ userId: "admin123", role: "ADMIN" });
  });

  // Mock sweet data for testing
  const mockUpdatedSweet = {
    id: 1,
    name: "Updated Chocolate",
    category: "CHOCOLATE" as SweetCategory,
    price: 12.99,
    quantity: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
      expect(res.body.success).toBe(true);
    });
  });

  // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should accept valid update data with all fields", async () => {
      (sweetService.updateSweet as Mock).mockResolvedValueOnce(mockUpdatedSweet);

      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", validAdminToken)
        .send({
          name: "Updated Chocolate",
          category: "CHOCOLATE",
          price: 12.99,
          quantity: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sweetService.updateSweet).toHaveBeenCalledWith(1, {
        name: "Updated Chocolate",
        category: "CHOCOLATE",
        price: 12.99,
        quantity: 8,
      });
    });

    it("should fail with invalid data (negative quantity)", async () => {
      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", validAdminToken)
        .send({
          name: "Test Sweet",
          quantity: -5, // Invalid negative quantity
        });

      expect(res.status).toBe(400);
    });
  });

  // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should call updateSweet service with correct parameters", async () => {
      (sweetService.updateSweet as Mock).mockResolvedValueOnce(mockUpdatedSweet);

      const updateData = {
        name: "New Chocolate Name",
        category: "CHOCOLATE" as SweetCategory,
        price: 15.99,
        quantity: 10,
      };

      const res = await request(app)
        .put("/api/sweets/1")
        .set("Authorization", validAdminToken)
        .send(updateData);

      expect(sweetService.updateSweet).toHaveBeenCalledWith(1, updateData);
      expect(sweetService.updateSweet).toHaveBeenCalledTimes(1);
    });
    
    it("should handle service layer errors (sweet not found)", async () => {
      (sweetService.updateSweet as Mock).mockRejectedValueOnce(
        new Error("Sweet not found")
      );

      const res = await request(app)
        .put("/api/sweets/999")
        .set("Authorization", validAdminToken)
        .send({
          name: "Updated Sweet",
          quantity: 5,
        });

      expect(res.status).toBe(500);
    });

    });



});