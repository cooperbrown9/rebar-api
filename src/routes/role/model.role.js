import { Schema, model } from 'mongoose';

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    agencyId: {
        type: Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    _permissions: { // Internal array storage
        type: [{
            type: String,
            // validate: validatePermission
        }],
        required: true,
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
});

// Virtual property to handle permissions as a Set
RoleSchema.virtual('permissions')
    .get(function () {
        return new Set(this._permissions);
    })
    .set(function (value) {
        // Accept either Set, Array, or any iterable and convert to unique array
        this._permissions = [...new Set(value)];
    });

// Create indexes
RoleSchema.index({ name: 1 });

const Role = model('Role', RoleSchema)

export default Role

