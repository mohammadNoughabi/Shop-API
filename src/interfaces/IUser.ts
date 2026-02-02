import {Document , Schema} from "mongoose"

export interface IUser extends Document {
    username:string;
    email:string;
    password:string;
    profilePic?:string;
    favorites:Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}