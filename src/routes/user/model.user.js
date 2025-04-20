import mongoose, { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    agencyId: {
        type: Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    password: {
        type: String,
        default: 'abc123',
        select: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    id: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.pre('save', async function (next) {
    const pw = this.password;

    const hash = await bcrypt.hash(pw, 10);

    this.password = hash;

    next()
})

const User = model('User', UserSchema)

export default User
