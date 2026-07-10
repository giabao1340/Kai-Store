import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) {}

  // ── Xử lý webhook từ SePay ────────────────────────
  async handleSepayWebhook(body: any) {
    try {
      /*
        Body từ SePay có dạng:
        {
          id: 12345,
          gateway: "MB Bank",
          transactionDate: "2024-01-01 12:00:00",
          accountNumber: "0385445419",
          code: "KAI A1B2C3D4",  ← nội dung chuyển khoản
          content: "KAI A1B2C3D4 chuyen khoan",
          transferType: "in",
          transferAmount: 2800000,
          referenceCode: "FT24001234567",
          description: "...",
        }
      */

      const { transferType, content, transferAmount, referenceCode } = body;

      // Chỉ xử lý giao dịch tiền vào
      if (transferType !== 'in') {
        return { success: true, message: 'Skipped outgoing transaction' };
      }

      // Tìm orderId từ nội dung chuyển khoản
      // Nội dung format: "KAI XXXXXXXX" (8 ký tự cuối orderId)
      const match = content.toUpperCase().match(/KAI\s+([A-Z0-9]{8})/);
      if (!match) {
        this.logger.warn('No order code found in content:', content);
        return { success: true, message: 'No order code found' };
      }

      const orderSuffix = match[1]; // 8 ký tự cuối orderId

      // Tìm order khớp với suffix
      const order = await this.prisma.order.findFirst({
        where: {
          id: { endsWith: orderSuffix.toLowerCase() },
        },
        include: { payment: true },
      });

      if (!order) {
        this.logger.warn('Order not found for suffix:', orderSuffix);
        return { success: true, message: 'Order not found' };
      }

      if (!order.payment) {
        this.logger.warn('Payment not found for order:', order.id);
        return { success: true, message: 'Payment not found' };
      }

      // Check đã thanh toán chưa
      if (order.payment.status === 'PAID') {
        return { success: true, message: 'Already paid' };
      }

      // Check số tiền khớp không (cho phép sai lệch 1000đ)
      const expectedAmount = Number(order.finalAmount);
      const receivedAmount = Number(transferAmount);
      if (Math.abs(expectedAmount - receivedAmount) > 1000) {
        this.logger.warn(
          `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
        );
        return { success: true, message: 'Amount mismatch' };
      }

      // ✅ Cập nhật payment status = PAID
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'PAID',
          transactionId: referenceCode,
          paidAt: new Date(),
        },
      });

      // Cập nhật order status = CONFIRMED
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      });

      this.logger.log(`Payment confirmed for order: ${order.id}`);
      return { success: true, message: 'Payment confirmed' };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      // Trả 200 để SePay không retry
      return { success: false, message: 'Internal error' };
    }
  }

  // ── Frontend polling check ─────────────────────────
  async checkPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    return {
      status: payment?.status ?? 'UNPAID',
      isPaid: payment?.status === 'PAID',
      paidAt: payment?.paidAt,
      transactionId: payment?.transactionId,
    };
  }
}
