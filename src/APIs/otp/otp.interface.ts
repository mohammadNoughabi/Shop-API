export interface IOtp {
    email: string;
    code: string;
    isDeleted:boolean;
    createdAt: Date;
    expiresAt: Date;
}