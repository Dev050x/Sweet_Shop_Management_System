import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import * as sweerService from "../../src/services/sweet.service";

// mock jwt for auth middleware
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "user123", role: "USER" })),
  },
}));


// mock prisma
vi.mock("../../src/utils/prisma", () => ({
  prisma: {
    sweet: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    purchase: {
        create: vi.fn(),
    },
    $transaction: vi.fn(),
    voucher: {
        findUnique: vi.fn(),
    }
  },
}));

import { prisma } from "../../src/utils/prisma";
import jwt from "jsonwebtoken";

describe("user should purchase item with discount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (jwt.verify as Mock).mockReturnValue({ userId: "user123", role: "USER" });
    });
    
     const sweet_req = {
            id: 1,
            name: "Chocolava", 
            category: "CHOCOLATE",
            price: 100,
            quantity: 5,
            discount: 20,
        };

    it("user should able to purchase item with discount", async () => {
        //arrange
        const price = 100;
        const quantity_to_buy = 1;
        const sweet_discounted_price = 80;
        const coupon = {
            id: 1,
            code: "HAPPY20",
            discount: 20,
            isActive: true,
            validTill: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        (prisma.sweet.findUnique as Mock).mockResolvedValueOnce({...sweet_req,id:1});
        (prisma.voucher.findUnique as Mock).mockResolvedValueOnce(coupon);
        (prisma.$transaction as Mock).mockResolvedValue([
            { ...sweet_req, quantity: 4 },
            {}
        ]);
        
        //add  
        await sweerService.purchaseSweet(1, quantity_to_buy, 1, "HAPPY20");

        //assert
        expect(prisma.purchase.create).toHaveBeenCalledWith({
            data: {
                userId: 1,
                sweetId: 1,
                quantity: quantity_to_buy,
                totalCost: 80,
            }
        });
    })
})
