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
  getAllSweets: vi.fn(),
}));


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

    // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should call getAllSweets service", async () => {
      const mockSweets = [
        {
          id: "sweet1",
          name: "Chocolate Bar",
          category: "CHOCOLATE" as SweetCategory,
          price: 10.5,
          quantity: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "sweet2",
          name: "Candy Cane",
          category: "CANDY" as SweetCategory,
          price: 5.0,
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      (sweetService.getAllSweets as Mock).mockResolvedValueOnce(mockSweets);

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", validToken);

      expect(sweetService.getAllSweets).toHaveBeenCalledTimes(1);
      expect(sweetService.getAllSweets).toHaveBeenCalledWith();
    });

    it("should handle service layer errors", async () => {
      (sweetService.getAllSweets as Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", validToken);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("internal server error");
    });

     // ---------------- Controller + Integration tests ----------------
  describe("Controller + Integration", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should successfully get all sweets and return correct response", async () => {
      const mockSweets = [
        {
          id: "sweet1",
          name: "Chocolate Delight",
          category: "CHOCOLATE" as SweetCategory,
          price: 15.99,
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "sweet2",
          name: "Gummy Bears",
          category: "CANDY" as SweetCategory,
          price: 8.50,
          quantity: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      (sweetService.getAllSweets as Mock).mockResolvedValueOnce(mockSweets);

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", validToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Sweets fetched successfully");
      expect(res.body.sweets).toHaveLength(2);
      expect(res.body.sweets[0]).toMatchObject({
        id: "sweet1",
        name: "Chocolate Delight",
        category: "CHOCOLATE",
        price: 15.99,
        quantity: 10,
      });
    });
  });


   });

   });
  
});