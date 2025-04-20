import RoleService from './service.role.js';

import { APISuccess, GenericError } from '../../response/index.js';

export async function add(req, res, next) {
    const { data: role } = req.body;

    try {
        const _role = await RoleService.add(role)

        return res.json(new APISuccess({ data: _role, message: 'Role added' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: e.message || 'Could not add Role', status: e.status || 400 })
        return res.status(err.status).json(err)
    }
}

export async function get(req, res, next) {
    const { roleId } = req.params;

    try {
        const _role = await RoleService.get(roleId)

        return res.json(new APISuccess({ data: _role, message: 'Role fetched' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: e.message || 'Could not get Role', status: e.status || 400 })
        return res.status(err.status).json(err)
    }
}

export async function find(req, res, next) {
    const { query } = req;

    try {
        const _role = await RoleService.find(query)

        return res.json(new APISuccess({ data: _role, message: 'Roles found' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: e.message || 'Could not find Role', status: e.status || 400 })
        return res.status(err.status).json(err)
    }
}

export async function update(req, res, next) {
    const { roleId } = req.params;
    const { body: role } = req;

    try {
        console.log(role)
        const _role = await RoleService.update(roleId, role)

        return res.json(new APISuccess({ data: _role, message: 'Role updated' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: e.message || 'Could not update Role', status: e.status || 400 })
        return res.status(err.status).json(err)
    }
}

export default {
    add,
    get,
    find,
    update
}