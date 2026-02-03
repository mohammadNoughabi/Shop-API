import {Document , Schema} from "mongoose"

export interface IUser extends Document {
    username:string;
    email:string;
    password:string;
    role:string;
    profilePic?:string;
    favorites:Schema.Types.ObjectId[];
    isDeleted:boolean;
    deletedAt:Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

