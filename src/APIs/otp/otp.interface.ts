export interface IOtp {
  email: string;
  code: string;
  createdAt: Date;
  isExpired: boolean;
  expiredAt: Date;
}
