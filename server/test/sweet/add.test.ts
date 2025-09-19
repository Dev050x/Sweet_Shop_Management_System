// test/sweet/add.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import app from "../../src/index";
import * as sweetService from "../../src/services/sweet.service";
import { SweetCategory } from "@prisma/client";


// mock jwt for auth middleware
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
      create: vi.fn(),
    },
  },
}));

// mock sweet service
vi.mock("../../src/services/sweet.service", () => ({
  addSweet: vi.fn(),
}));

import { prisma } from "../../src/utils/prisma";
import jwt from "jsonwebtoken";

describe("Sweet Add Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default JWT behavior for auth middleware
    (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
  });

  // ---------------- Auth middleware tests ----------------
  describe("Authentication middleware", () => {
    it("should fail without authorization header", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .send({
          name: "Chocolate Bar",
          category: "CHOCOLATE",
          price: 10.5,
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
        .post("/api/sweets")
        .set("Authorization", "Bearer invalid.jwt.token")
        .send({
          name: "Chocolate Bar",
          category: "CHOCOLATE",
          price: 10.5,
          quantity: 5,
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });

  // ---------------- Schema validation ----------------
  describe("Schema validation", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should fail if name is too short", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", validToken)
        .send({
          name: "A", // Too short
          category: "CHOCOLATE",
          price: 10.5,
          quantity: 5,
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ---------------- Service layer tests ----------------
  describe("Service layer", () => {
    const validToken = "Bearer valid.jwt.token";
    const validSweetData = {
      name: "Chocolate Bar",
      category: "CHOCOLATE" as SweetCategory,
      price: 10.5,
      quantity: 5,
    };

    it("should call addSweet service with correct parameters", async () => {
      const mockSweet = {
        id: "sweet123",
        name: "Chocolate Bar",
        category: "CHOCOLATE" as SweetCategory,
        price: 10.5,
        quantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sweetService.addSweet as Mock).mockResolvedValueOnce(mockSweet);

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", validToken)
        .send(validSweetData);

      expect(sweetService.addSweet).toHaveBeenCalledWith(
        "Chocolate Bar",
        "CHOCOLATE",
        10.5,
        5
      );
      expect(sweetService.addSweet).toHaveBeenCalledTimes(1);
    });

    it("should handle service layer errors", async () => {
      (sweetService.addSweet as Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", validToken)
        .send(validSweetData);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("internal server error");
    });

  });

  // ---------------- Controller tests ----------------
  describe("Controller", () => {
    const validToken = "Bearer valid.jwt.token";

    it("should successfully add sweet and return correct response", async () => {
      const mockSweet = {
        id: "sweet123",
        name: "Chocolate Delight",
        category: "CHOCOLATE" as SweetCategory,
        price: 15.99,
        quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sweetService.addSweet as Mock).mockResolvedValueOnce(mockSweet);

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", validToken)
        .send({
          name: "Chocolate Delight",
          category: "CHOCOLATE",
          price: 15.99,
          quantity: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Sweet added successfully");
      expect(res.body.sweet).toMatchObject({
        id: "sweet123",
        name: "Chocolate Delight",
        category: "CHOCOLATE",
        price: 15.99,
        quantity: 10,
      });
    });

    
  });


  });

  
});