import mongoose from "mongoose";


const schema = new mongoose.Schema({
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pinCode: { type: Number, required: true },
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered"],
        default: "Processing",
    },
    user: {
        type: String,
        ref: "User",
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
    },
    shippingCharges: {
        type: Number,
        required: true,
    },
    discound: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    orderItems: [
        {
            name: { type: String, required: true },
            photo: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            productId: { type: String, required: true }
        }
    ]
}
)

const Order = mongoose.model("Order", schema);

export default Order;