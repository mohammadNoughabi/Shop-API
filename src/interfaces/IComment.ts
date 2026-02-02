import {Schema} from "mongoose"

export interface IComment {
    username:string;
    content:string;
    productId:Schema.Types.ObjectId;
    likes:number;
    dislikes:number;
    createdAt: Date;
    updatedAt: Date;
}