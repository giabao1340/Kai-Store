import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmailService {
  private resend: Resend;
  protected readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
  }

  async sendOrderConfirmationEmail(params: {
    to: string;
    userName: string;
    orderId: string;
    finalAmount: number;
    items: {
      snapProductName: string;
      snapSize: string;
      snapColor: string;
      quantity: number;
      price: Prisma.Decimal;
    }[];
    snapFullName: string;
    snapPhone: string;
    snapStreet: string;
    snapWard: string;
    snapDistrict: string;
    snapProvince: string;
    confirmToken: string;
  }) {
    const confirmUrl = `${this.config.get('FRONTEND_URL')}/orders/confirm?token=${params.confirmToken}`;
    const cancelUrl = `${this.config.get('FRONTEND_URL')}/orders/confirm?token=${params.confirmToken}&action=cancel`;

    const itemsHtml = params.items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
          <p style="margin:0;font-size:14px;font-weight:500;color:#111">${item.snapProductName}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">${item.snapColor} · Size ${item.snapSize} · x${item.quantity}</p>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;font-weight:500;color:#111">
          ${(Number(item.price) * item.quantity).toLocaleString('vi-VN')}đ
        </td>
      </tr>
    `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:0;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <div style="background:#000;padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">KAI STORE</h1>
            <p style="color:#9ca3af;margin:8px 0 0;font-size:14px;">Xác nhận đơn hàng</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <p style="font-size:16px;color:#111;margin:0 0 8px;">Xin chào <strong>${params.userName}</strong>,</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">
              Đơn hàng <strong>#${params.orderId.slice(-8).toUpperCase()}</strong> của bạn đã được đặt thành công.
              Vui lòng xác nhận để chúng tôi bắt đầu xử lý.
            </p>

            <!-- Danh sách sản phẩm -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${itemsHtml}
            </table>

            <!-- Tổng tiền -->
            <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:14px;color:#6b7280;">Tổng cộng</span>
                <span style="font-size:16px;font-weight:700;color:#111;">${params.finalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <!-- Địa chỉ -->
            <div style="margin-bottom:24px;">
              <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px;">Giao đến:</p>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
                ${params.snapFullName} · ${params.snapPhone}<br>
                ${params.snapStreet}, ${params.snapWard}, ${params.snapDistrict}, ${params.snapProvince}
              </p>
            </div>

            <!-- Buttons -->
            <div style="text-align:center;margin-bottom:24px;">
              <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
                ⏰ Vui lòng xác nhận trong vòng <strong>24 giờ</strong>, sau đó đơn hàng sẽ tự động bị hủy.
              </p>
              <a href="${confirmUrl}"
                style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:99px;text-decoration:none;font-size:15px;font-weight:600;margin-right:12px;">
                ✅ Xác nhận đơn hàng
              </a>
              <a href="${cancelUrl}"
                style="display:inline-block;background:#fff;color:#374151;padding:14px 32px;border-radius:99px;text-decoration:none;font-size:15px;border:1px solid #d1d5db;">
                ❌ Hủy đơn hàng
              </a>
            </div>

            <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
              Nếu bạn không đặt đơn hàng này, vui lòng bỏ qua email này.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 Kai Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: process.env.EMAIL_FROM, // ← đổi thành domain của bạn
        to: params.to,
        subject: `[Kai Store] Xác nhận đơn hàng #${params.orderId.slice(-8).toUpperCase()}`,
        html,
      });
      this.logger.log(`Confirmation email sent to ${params.to}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      // Không throw — email lỗi không nên block việc tạo order
    }
  }
}
