import 'jsonwebtoken';

// JwtPayload uses in authentication API in JwtService
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    username: string;
    role: string;
    email?: string; // optional, only if you include it in the token payload
  }
}
