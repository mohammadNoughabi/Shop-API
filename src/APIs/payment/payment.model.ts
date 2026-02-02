import mongoose from 'mongoose'

import type { IPayment } from './payment.interface.ts'
import { PAYMENT_STATUSES } from './payment.constants.ts'    

const paymentSchema = new mongoose.Schema<IPayment>(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        transactionId: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: PAYMENT_STATUSES,
            default: "pending"
        },
        paidAt: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;