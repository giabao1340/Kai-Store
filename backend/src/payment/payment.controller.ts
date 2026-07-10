import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private paymentService: PaymentService) {}

  // ── Webhook nhận từ SePay ──────────────────────────
  // SePay gọi endpoint này khi có giao dịch mới
  @Post('webhook/sepay')
  async handleSepayWebhook(
    @Body() body: any,
    @Headers('apikey') apiKey: string,
  ) {
    this.logger.log('SePay webhook received:', JSON.stringify(body));

    // Verify API key
    if (apiKey !== process.env.SEPAY_WEBHOOK_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.paymentService.handleSepayWebhook(body);
  }

  // ── Frontend polling check status ──────────────────
  @Get(':orderId/status')
  checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentStatus(orderId);
  }
}
