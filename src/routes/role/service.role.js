import Role from './model.role.js';

export async function add(role) {
    return await Role.create(role);
}

export async function get(roleId) {
    return await Role.findById(roleId);
}

export async function findFirst(query) {
    return await Role.findOne({ ...query })
}

export async function find(query) {
    return await Role.find({ ...query })
}

export async function update(roleId, role) {
     
    return await Role.findByIdAndUpdate(roleId, { $set: { ...role } }, { new: true });
}

export default {
    add,
    get,
    findFirst,
    find,
    update
}