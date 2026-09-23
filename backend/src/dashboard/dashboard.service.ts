import { Injectable } from '@nestjs/common';
import { DashboardQueryDto, DashboardRange } from './dto/dashboard-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: DashboardQueryDto) {
    const range = query.range ?? DashboardRange.THIRTY_DAYS;

    const { start, end } = this.getDateRange(range);

    const previous = this.getPreviousDateRange(start, end);

    const [
      kpi,
      revenue,
      orderStatus,
      topProducts,
      lowStock,
      recentOrders,
      paymentMethods,
      brandRevenue,
    ] = await Promise.all([
      this.getKpi(start, end, previous.start, previous.end),

      this.getRevenue(start, end),

      this.getOrderStatus(start, end),

      this.getTopProducts(start, end),

      this.getLowStock(),

      this.getRecentOrders(),

      this.getPaymentMethods(start, end),

      this.getBrandRevenue(start, end),
    ]);

    return {
      range,
      kpi,
      revenue,
      orderStatus,
      topProducts,
      lowStock,
      recentOrders,
      paymentMethods,
      brandRevenue,
    };
  }

  private getDateRange(range: DashboardRange) {
    const end = new Date();
    const start = new Date(end);

    switch (range) {
      case DashboardRange.SEVEN_DAYS:
        start.setDate(start.getDate() - 7);
        break;

      case DashboardRange.THIRTY_DAYS:
        start.setDate(start.getDate() - 30);
        break;

      case DashboardRange.THREE_MONTHS:
        start.setMonth(start.getMonth() - 3);
        break;

      case DashboardRange.SIX_MONTHS:
        start.setMonth(start.getMonth() - 6);
        break;

      case DashboardRange.ONE_YEAR:
        start.setFullYear(start.getFullYear() - 1);
        break;

      default:
        start.setDate(start.getDate() - 30);
    }

    return {
      start,
      end,
    };
  }
  private getPreviousDateRange(start: Date, end: Date) {
    const duration = end.getTime() - start.getTime();

    return {
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime()),
    };
  }
  private calculateGrowth(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
  private async getKpi(
    start: Date,
    end: Date,
    previousStart: Date,
    previousEnd: Date,
  ) {
    const [
      revenue,
      previousRevenue,
      orders,
      previousOrders,
      paidOrders,
      previousPaidOrders,
      customers,
      previousCustomers,
      products,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      // Revenue hiện tại
      this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: start,
            lt: end,
          },
          payment: {
            status: 'PAID',
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),

      // Revenue kỳ trước
      this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousStart,
            lt: previousEnd,
          },
          payment: {
            status: 'PAID',
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),

      // Tổng số đơn hiện tại
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      }),

      // Tổng số đơn kỳ trước
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: previousEnd,
          },
        },
      }),

      // Số đơn đã thanh toán hiện tại
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: start,
            lt: end,
          },
          payment: {
            status: 'PAID',
          },
        },
      }),

      // Số đơn đã thanh toán kỳ trước
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: previousEnd,
          },
          payment: {
            status: 'PAID',
          },
        },
      }),

      // Khách hàng mới hiện tại
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      }),

      // Khách hàng mới kỳ trước
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: previousStart,
            lt: previousEnd,
          },
        },
      }),

      // Tổng số sản phẩm
      this.prisma.product.count(),

      // Sản phẩm sắp hết hàng
      this.prisma.productVariant.count({
        where: {
          stock: {
            gt: 0,
            lte: 5,
          },
        },
      }),

      // Sản phẩm hết hàng
      this.prisma.productVariant.count({
        where: {
          stock: 0,
        },
      }),
    ]);

    const revenueValue = Number(revenue._sum.finalAmount ?? 0);

    const previousRevenueValue = Number(previousRevenue._sum.finalAmount ?? 0);

    // AOV chỉ tính trên những đơn đã thanh toán
    const averageOrderValue = paidOrders > 0 ? revenueValue / paidOrders : 0;

    return {
      revenue: revenueValue,

      previousRevenue: previousRevenueValue,

      revenueGrowth: this.calculateGrowth(revenueValue, previousRevenueValue),

      orders,

      previousOrders,

      ordersGrowth: this.calculateGrowth(orders, previousOrders),

      customers,

      previousCustomers,

      customersGrowth: this.calculateGrowth(customers, previousCustomers),

      products,

      lowStockProducts,

      outOfStockProducts,

      averageOrderValue,
    };
  }
  private async getRevenue(start: Date, end: Date) {
    const result = await this.prisma.$queryRaw<
      {
        date: Date;
        revenue: number;
        orders: bigint;
      }[]
    >`
    SELECT
      DATE(o."createdAt") AS date,

      COALESCE(
        SUM(o."finalAmount"),
        0
      ) AS revenue,

      COUNT(*) AS orders

    FROM "orders" o

    INNER JOIN "payments" pay
      ON pay."orderId" = o.id

    WHERE
      o."createdAt" >= ${start}
      AND o."createdAt" < ${end}

      AND pay."status" = 'PAID'

    GROUP BY DATE(o."createdAt")

    ORDER BY date ASC
  `;

    return result.map((item) => ({
      date: item.date.toISOString().slice(0, 10),
      revenue: Number(item.revenue),
      orders: Number(item.orders),
    }));
  }
  private async getOrderStatus(start: Date, end: Date) {
    const result = await this.prisma.order.groupBy({
      by: ['status'],

      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },

      _count: {
        _all: true,
      },
    });

    return result.map((item) => ({
      status: item.status,
      count: item._count._all,
    }));
  }
  private async getTopProducts(start: Date, end: Date) {
    const result = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        imageUrl: string | null;
        soldQuantity: bigint;
        revenue: number;
      }[]
    >`
    SELECT
      p.id AS "productId",
      p.name AS "productName",

      MAX(oi."snapImageUrl") AS "imageUrl",

      SUM(oi.quantity) AS "soldQuantity",

      SUM(
        oi.quantity * oi.price
      ) AS revenue

    FROM "order_items" oi

    INNER JOIN "orders" o
      ON o.id = oi."orderId"

    INNER JOIN "payments" pay
      ON pay."orderId" = o.id

    INNER JOIN "product_variants" pv
      ON pv.id = oi."variantId"

    INNER JOIN "products" p
      ON p.id = pv."productId"

    WHERE
      o."createdAt" >= ${start}
      AND o."createdAt" < ${end}

      AND pay."status" = 'PAID'

    GROUP BY
      p.id,
      p.name

    ORDER BY
      "soldQuantity" DESC

    LIMIT 5
  `;

    return result.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      soldQuantity: Number(item.soldQuantity),
      revenue: Number(item.revenue),
    }));
  }
  private async getLowStock() {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },

      include: {
        product: true,
      },

      orderBy: {
        stock: 'asc',
      },

      take: 10,
    });

    return variants.map((variant) => ({
      productId: variant.productId,

      variantId: variant.id,

      productName: variant.product.name,

      sku: variant.sku,

      size: variant.size,

      color: variant.color,

      quantity: variant.stock,
    }));
  }
  private async getRecentOrders() {
    const orders = await this.prisma.order.findMany({
      take: 10,

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        user: true,
        payment: true,
      },
    });

    return orders.map((order) => ({
      orderId: order.id,
      customerName: order.user.name,
      totalAmount: Number(order.finalAmount),
      status: order.status,
      paymentStatus: order.payment?.status ?? 'UNPAID',
      createdAt: order.createdAt.toISOString(),
    }));
  }
  private async getPaymentMethods(start: Date, end: Date) {
    const result = await this.prisma.payment.groupBy({
      by: ['method'],

      where: {
        status: 'PAID',

        paidAt: {
          gte: start,
          lt: end,
        },
      },

      _count: {
        _all: true,
      },

      _sum: {
        amount: true,
      },
    });

    return result.map((item) => ({
      method: item.method,
      count: item._count._all,
      revenue: Number(item._sum.amount ?? 0),
    }));
  }
  private async getBrandRevenue(start: Date, end: Date) {
    const result = await this.prisma.$queryRaw<
      {
        brandId: string;
        brandName: string;
        revenue: number;
        soldQuantity: bigint;
      }[]
    >`
    SELECT
      b.id AS "brandId",
      b.name AS "brandName",

      COALESCE(
        SUM(oi.quantity * oi.price),
        0
      ) AS revenue,

      COALESCE(
        SUM(oi.quantity),
        0
      ) AS "soldQuantity"

    FROM "order_items" oi

    INNER JOIN "orders" o
      ON o.id = oi."orderId"

    INNER JOIN "payments" pay
      ON pay."orderId" = o.id

    INNER JOIN "product_variants" pv
      ON pv.id = oi."variantId"

    INNER JOIN "products" p
      ON p.id = pv."productId"

    INNER JOIN "brands" b
      ON b.id = p."brandId"

    WHERE
      o."createdAt" >= ${start}
      AND o."createdAt" < ${end}

      AND pay."status" = 'PAID'

    GROUP BY
      b.id,
      b.name

    ORDER BY
      revenue DESC
  `;

    return result.map((item) => ({
      brandId: item.brandId,
      brandName: item.brandName,
      revenue: Number(item.revenue),
      soldQuantity: Number(item.soldQuantity),
    }));
  }
}
