export interface IZarinpalService {
  baseUrl: string;
  merchantId: string;
  sandbox: boolean;
}

export interface RequestPaymentDto {
  amount: number;
  currency?: string;
  description: string;
  callbackUrl: string;
  reffererId?: string;
  metadata: {
    email?: string;
    mobile?: string;
    orderId?: string;
  };
}

export interface RequestPaymentResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    feeType: string;
    fee: number;
  };
  errors: string[];
}

export interface VerifyPaymentResponse {
  data: {
    code: number;
    message: string;
    ref_id?: number;
    card_pan?: string;
    card_hash?: string;
    fee_type?: string;
    fee?: number;
  };
  errors: string[];
}
