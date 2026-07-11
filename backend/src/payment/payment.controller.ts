import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private paymentService: PaymentService) {}

  // SePay gọi endpoint này khi có giao dịch mới
  @Post('webhook/sepay')
  @HttpCode(200) // SePay cần nhận 200 mới không retry
  async handleSepayWebhook(
    @Body() body: any,
    @Headers('apikey') apiKey: string,
  ) {
    this.logger.log('SePay webhook received:', JSON.stringify(body));

    // Verify API key từ SePay
    if (apiKey !== process.env.SEPAY_WEBHOOK_API_KEY) {
      this.logger.warn('Invalid API key:', apiKey);
      throw new UnauthorizedException('Invalid API key');
    }

    return this.paymentService.handleSepayWebhook(body);
  }

  // Frontend polling check status
  @Get(':orderId/status')
  checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentStatus(orderId);
  }
}
