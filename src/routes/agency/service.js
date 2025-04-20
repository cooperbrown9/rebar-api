import Agency from './model.js';

export async function add(agency) {
    return await Agency.create(agency)
}

export async function find(query) {
    return await Agency.find(query)
}

export async function get(id) {
    return await Agency.findById(id)
}

export async function update(id, agency) {
    return await Agency.findByIdAndUpdate(id, { $set: { ...agency } }, { new: true })
}

export default {
    add,
    find,
    get,
    update
}