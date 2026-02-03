import 'jsonwebtoken';

// JwtPayload uses in authentication API in JwtService
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    email: string;
    role:string;
  }
}