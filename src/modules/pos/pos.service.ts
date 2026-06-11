import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";

export interface CartItem {
  name: string;
  priceCents: number;
  quantity: number;
}

/**
 * Point-of-sale engine for the clinic: a product catalog and cart-checkout
 * sales (consultations, procedures, lab tests, pharmacy). Gated by the "pos"
 * module. Totals are always recomputed server-side — the client is never
 * trusted for money.
 */
export const posService = {
  // ── Products ───────────────────────────────────────────────────────────
  listProducts(doctorId: string, activeOnly = false) {
    return prisma.posProduct.findMany({
      where: { doctorId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  },

  createProduct(
    doctorId: string,
    input: { name: string; category: string; priceCents: number },
  ) {
    return prisma.posProduct.create({ data: { doctorId, ...input } });
  },

  async updateProduct(
    doctorId: string,
    id: string,
    input: Partial<{ name: string; category: string; priceCents: number; isActive: boolean }>,
  ) {
    await this.assertProductOwned(doctorId, id);
    return prisma.posProduct.update({ where: { id }, data: input });
  },

  async removeProduct(doctorId: string, id: string) {
    await this.assertProductOwned(doctorId, id);
    await prisma.posProduct.delete({ where: { id } });
  },

  async assertProductOwned(doctorId: string, id: string) {
    const p = await prisma.posProduct.findUnique({ where: { id }, select: { doctorId: true } });
    if (!p) throw new NotFoundError("Product not found");
    if (p.doctorId !== doctorId) throw new ForbiddenError();
  },

  // ── Sales ──────────────────────────────────────────────────────────────
  /** Records a checkout. Recomputes totals from the cart; ignores client totals. */
  async createSale(
    doctorId: string,
    input: {
      items: CartItem[];
      patientName?: string;
      discountCents?: number;
      taxCents?: number;
      paymentMethod?: string;
    },
  ) {
    const items = (input.items ?? []).filter((i) => i.quantity > 0 && i.priceCents >= 0);
    if (items.length === 0) throw new AppError("Cart is empty", 400);

    const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    const discountCents = Math.min(Math.max(0, input.discountCents ?? 0), subtotalCents);
    const taxCents = Math.max(0, input.taxCents ?? 0);
    const totalCents = subtotalCents - discountCents + taxCents;

    const year = new Date().getFullYear();
    const count = await prisma.posSale.count({
      where: { saleNumber: { startsWith: `POS-${year}-` } },
    });

    for (let attempt = 0; attempt < 3; attempt++) {
      const saleNumber = `POS-${year}-${String(count + 1 + attempt).padStart(5, "0")}`;
      try {
        return await prisma.posSale.create({
          data: {
            doctorId,
            saleNumber,
            patientName: input.patientName?.trim() || null,
            items: items as unknown as Prisma.InputJsonValue,
            subtotalCents,
            discountCents,
            taxCents,
            totalCents,
            paymentMethod: input.paymentMethod ?? "cash",
          },
        });
      } catch (err) {
        if (attempt === 2) throw err;
      }
    }
    throw new Error("unreachable");
  },

  getSale(id: string) {
    return prisma.posSale.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { fullName: true, clinicName: true, clinicAddress: true, phone: true },
        },
      },
    });
  },

  listSales(doctorId: string, limit = 50) {
    return prisma.posSale.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  /** Today's POS totals for the setup dashboard. */
  async todayStats(doctorId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const sales = await prisma.posSale.findMany({
      where: { doctorId, createdAt: { gte: start } },
      select: { totalCents: true },
    });
    return {
      count: sales.length,
      revenueCents: sales.reduce((s, x) => s + x.totalCents, 0),
    };
  },
};
