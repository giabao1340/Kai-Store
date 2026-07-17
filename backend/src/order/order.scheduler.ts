// src/order/order.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderScheduler {
  private readonly logger = new Logger(OrderScheduler.name);

  constructor(private prisma: PrismaService) {}

  // Chạy mỗi 1 giờ
  @Cron(CronExpression.EVERY_HOUR)
  async cancelExpiredOrders() {
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        confirmExpiredAt: { lt: new Date() }, // hết hạn
        confirmToken: { not: null },
      },
      include: { items: true },
    });

    this.logger.log(`Found ${expiredOrders.length} expired orders`);

    for (const order of expiredOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', confirmToken: null },
        });

        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { decrement: 1 } },
          });
        }
      });

      this.logger.log(`Auto-cancelled expired order: ${order.id}`);
    }
  }
}
