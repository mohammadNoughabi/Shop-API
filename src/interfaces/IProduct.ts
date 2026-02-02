import {Document , Schema} from 'mongoose'

export interface IProduct extends Document {
    title:string;
    description:string;
    image:string;
    gallery:string[];
    price:string;
    rate:number;
    category:Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}