import axios from 'axios';

import type {
  IZarinpalService,
  RequestPaymentDto,
  RequestPaymentResponse,
  VerifyPaymentResponse,
} from './zarinpal.interface.ts';

export class ZarinpalService implements IZarinpalService {
  baseUrl: string;
  merchantId: string;
  sandbox: boolean;
  constructor() {
    this.merchantId = process.env.ZARINPAL_MERCHANT_ID as string;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.baseUrl = this.sandbox
      ? 'https://sandbox.zarinpal.com/'
      : 'https://payment.zarinpal.com';
  }

  async requestPayment(dto: RequestPaymentDto): Promise<{
    authority: string;
    redirectUrl: string;
  } | null> {
    const response = await axios.post<RequestPaymentResponse>(
      `${this.baseUrl}/pg/v4/payment/request.json`,
      {
        merchant_id: this.merchantId,
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
        callback_url: dto.callbackUrl,
        metadata: dto.metadata,
      },
    );

    if (response.data.data.code !== 100) {
      return null;
    }

    const authority = response.data.data.authority;
    const redirectUrl = `${this.baseUrl}/pg/StartPay/${authority}`;

    return { authority, redirectUrl };
  }

  async verifyPayment(
    authority: string,
    amount: number,
  ): Promise<{
    refId: number;
    cardPan?: string;
    cardHash?: string;
  } | null> {
    const response = await axios.post<VerifyPaymentResponse>(
      `${this.baseUrl}/pg/v4/payment/verify.json`,
      {
        merchant_id: this.merchantId,
        authority,
        amount,
      },
    );

    if (response.data.data.code !== 100 && response.data.data.code !== 101) {
      return null;
    }

    return {
      refId: response.data.data.ref_id as number,
      cardPan: response.data.data.card_pan,
      cardHash: response.data.data.card_hash,
    };
  }
}

export const zarinpalService = new ZarinpalService();
