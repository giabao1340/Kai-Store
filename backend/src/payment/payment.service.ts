import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) {}

  async handleSepayWebhook(body: any) {
    try {
      /*
        SePay webhook body:
        {
          id: 12345,
          gateway: "MBBank",
          transactionDate: "2026-07-10 10:00:00",
          accountNumber: "0123456789",
          content: "SEVQR 5U7LBNRL chuyen khoan",  ← nội dung CK
          transferType: "in",                      ← tiền vào
          transferAmount: 2800000,
          referenceCode: "FT26191234567",
          description: "...",
        }
      */

      const { transferType, content, transferAmount, referenceCode, id } = body;

      // Chỉ xử lý tiền vào
      if (transferType !== 'in') {
        return { success: true, message: 'Skipped outgoing transaction' };
      }

      // Parse nội dung chuyển khoản — format: "SEVQR XXXXXXXX"
      const upperContent = (content ?? '').toUpperCase();
      const match = upperContent.match(/SEVQR\s+([A-Z0-9]{8})/);

      if (!match) {
        this.logger.warn('No SEVQR order code in content:', content);
        return { success: true, message: 'No order code found' };
      }

      const orderSuffix = match[1].toLowerCase();
      this.logger.log('Found order suffix:', orderSuffix);

      // Tìm order theo 8 ký tự cuối id
      const orders = await this.prisma.order.findMany({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { payment: true },
      });

      const order = orders.find((o) => o.id.slice(-8) === orderSuffix);

      if (!order) {
        this.logger.warn('Order not found for suffix:', orderSuffix);
        return { success: true, message: 'Order not found' };
      }

      if (!order.payment) {
        this.logger.warn('Payment not found for order:', order.id);
        return { success: true, message: 'Payment not found' };
      }

      // Đã thanh toán rồi → bỏ qua
      if (order.payment.status === 'PAID') {
        return { success: true, message: 'Already paid' };
      }

      // Kiểm tra số tiền (cho phép sai lệch 1000đ)
      const expectedAmount = Number(order.finalAmount);
      const receivedAmount = Number(transferAmount);

      if (Math.abs(expectedAmount - receivedAmount) > 1000) {
        this.logger.warn(
          `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
        );
        // Vẫn cập nhật nếu muốn linh hoạt, hoặc return lỗi nếu muốn chặt
        return { success: true, message: 'Amount mismatch' };
      }

      // ✅ Cập nhật payment + order trong transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: order.payment!.id },
          data: {
            status: 'PAID',
            transactionId: referenceCode ?? String(id),
            paidAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' },
        });
      });

      this.logger.log(`✅ Payment confirmed for order: ${order.id}`);
      return { success: true, message: 'Payment confirmed', orderId: order.id };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      // Trả 200 để SePay không retry liên tục
      return { success: false, message: 'Internal error' };
    }
  }

  async checkPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    return {
      status: payment?.status ?? 'UNPAID',
      isPaid: payment?.status === 'PAID',
      paidAt: payment?.paidAt ?? null,
      transactionId: payment?.transactionId ?? null,
    };
  }
}
