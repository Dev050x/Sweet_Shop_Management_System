// test/sweet/delete.test.ts
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
      delete: vi.fn(),
    },
  },
}));

// mock sweet service
vi.mock("../../src/services/sweet.service", () => ({
  deleteSweet: vi.fn(),
}));

import jwt from "jsonwebtoken";

describe("Sweet Delete Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware (ADMIN role)
    (jwt.verify as Mock).mockReturnValue({ userId: "admin123", role: "ADMIN" });
  });

  const mockDeletedSweet = {
    id: 1,
    name: "Deleted Sweet",
    category: "CHOCOLATE",
    price: 10.99,
    quantity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };



  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .delete("/api/sweets/1");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided");
    });

    it("should fail when user is not admin", async () => {
      (jwt.verify as Mock).mockReturnValueOnce({ userId: "user123", role: "USER" });

      const res = await request(app)
        .delete("/api/sweets/1")
        .set("Authorization", "Bearer user.token");

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Admins only");
    });

  });

  // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validAdminToken = "Bearer valid.admin.token";

    it("should call deleteSweet service with correct ID", async () => {
      (sweetService.deleteSweet as Mock).mockResolvedValueOnce(mockDeletedSweet);

      const res = await request(app)
        .delete("/api/sweets/123")
        .set("Authorization", validAdminToken);

      expect(sweetService.deleteSweet).toHaveBeenCalledWith(123);
      expect(sweetService.deleteSweet).toHaveBeenCalledTimes(1);
      
    });

    it("should handle service layer errors", async () => {
      (sweetService.deleteSweet as Mock).mockRejectedValueOnce(
        new Error("Sweet not found")
      );

      const res = await request(app)
        .delete("/api/sweets/999")
        .set("Authorization", validAdminToken);

      expect(res.status).toBe(500);
    });

  });


});