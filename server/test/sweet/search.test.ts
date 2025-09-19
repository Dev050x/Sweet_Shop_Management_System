// test/sweet/search.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";


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
import { SweetCategory } from "@prisma/client";

describe("Sweet Search Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware
    (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
  });

  // Mock sweet data for testing
  const mockSweets = [
    {
      id: "sweet1",
      name: "Dark Chocolate",
      category: "CHOCOLATE" as SweetCategory,
      price: 15.99,
      quantity: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sweet2",
      name: "Milk Chocolate",
      category: "CHOCOLATE" as SweetCategory,
      price: 12.99,
      quantity: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

  // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should accept valid search with all parameters", async () => {
      (sweetService.searchSweets as Mock).mockResolvedValueOnce(mockSweets);

      const res = await request(app)
        .get("/api/sweets/search?name=chocolate&category=CHOCOLATE&minPrice=10&maxPrice=20")
        .set("Authorization", validToken);

      expect(sweetService.searchSweets).toHaveBeenCalledWith("chocolate", "CHOCOLATE", 10, 20);
    });

    it("should fail with invalid price format", async () => {
      const res = await request(app)
        .get("/api/sweets/search?minPrice=invalid")
        .set("Authorization", validToken);

      expect(res.status).toBe(400);
    });
  });

  // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should call searchSweets service with correct parameters", async () => {
      (sweetService.searchSweets as Mock).mockResolvedValueOnce(mockSweets);

      const res = await request(app)
        .get("/api/sweets/search?name=dark&category=CHOCOLATE&minPrice=15&maxPrice=30")
        .set("Authorization", validToken);

      expect(sweetService.searchSweets).toHaveBeenCalledWith("dark", "CHOCOLATE", 15, 30);
      expect(sweetService.searchSweets).toHaveBeenCalledTimes(1);
    });

    it("should handle service layer errors", async () => {
      (sweetService.searchSweets as Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const res = await request(app)
        .get("/api/sweets/search?name=chocolate")
        .set("Authorization", validToken);

      expect(res.status).toBe(500);
    });
  });


});