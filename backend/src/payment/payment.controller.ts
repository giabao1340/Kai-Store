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
  @HttpCode(200)
  async handleSepayWebhook(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    // Log để debug
    this.logger.log('Authorization header:', authorization);
    this.logger.log('Expected key:', process.env.SEPAY_WEBHOOK_API_KEY);

    const apiKey = authorization?.replace('Apikey ', '').trim();
    this.logger.log('Extracted key:', apiKey);
    this.logger.log(
      'Keys match:',
      apiKey === process.env.SEPAY_WEBHOOK_API_KEY,
    );

    if (apiKey !== process.env.SEPAY_WEBHOOK_API_KEY) {
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
