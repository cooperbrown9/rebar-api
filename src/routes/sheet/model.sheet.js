import { model, Schema } from 'mongoose';

const SheetSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: 'sheet-' + Date.now().toString()
    },
    agencyId: {
        type: Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    versions: [{
        type: Map,
        of: new Schema({
            type: { type: String, required: true },
            x: Number,
            y: Number,
            radius: Number,
            width: Number,
            height: Number,
            innerRadius: Number,
            outerRadius: Number,
            fill: String
        }, { _id: false, strict: false }) // Allows for flexible properties
    }],
    currentVersion: {
        type: Number,
        default: 0
    }
})

const Sheet = model('Sheet', SheetSchema);

export default Sheet