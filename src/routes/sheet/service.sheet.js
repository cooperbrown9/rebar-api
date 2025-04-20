import Sheet from './model.sheet.js';

export async function add(sheet) {
    return await Sheet.create(sheet)
}

export async function get(sheetId) {
    return await Sheet.findById(sheetId).lean()
}

export async function update(sheetId, sheet) {
    delete sheet._id
    delete sheet.__v
    return await Sheet.findByIdAndUpdate(sheetId, { $set: { ...sheet } })
}

export async function find(filters, options) {
    return await Sheet.find(filters, null, options)
}

export default {
    add,
    get,
    update,
    find
}