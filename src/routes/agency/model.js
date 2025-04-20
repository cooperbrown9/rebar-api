import { Schema, model } from "mongoose";

const AgencySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        default: null
    },
    address: {
        street: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        state: {
            type: String,
            default: ''
        },
        zip: {
            type: String,
            default: ''
        },
    },
}, {
    timestamps: true
});

const Agency = model('Agency', AgencySchema)

export default Agency
