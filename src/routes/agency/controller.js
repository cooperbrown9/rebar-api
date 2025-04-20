import AgencyService from './service.js';

import { APISuccess, GenericError } from '../../response/index.js';

export async function add(req, res, next) {
    const { data: agency } = req.body;
    try {
        const _agency = await AgencyService.add(agency)
        return res.json(new APISuccess({ data: _agency, message: 'Agency added' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: 'Could not add Agency', status: 400 })
        return res.status(err.status).json(err)
    }
}

export async function find(req, res, next) {
    const { query } = req;

    try {
        const _agencys = await AgencyService.find(query)
        return res.send(new APISuccess({ data: _agencys, message: 'Agencies found' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: 'Could not find Agencies', status: 400 })
        return res.status(err.status).json(err)
    }
}

export async function get(req, res, next) {
    const { agencyId } = req.params;

    try {
        const _agency = await AgencyService.get(agencyId)
        return res.send(new APISuccess({ data: _agency, message: 'Agency found' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: 'Could not find Agency', status: 400 })
        return res.status(err.status).json(err)
    }
}

export async function update(req, res, next) {
    const { agencyId } = req.params;
    const { agency } = req.body;

    try {
        const _agency = await AgencyService.update(agencyId, agency)
        return res.send(new APISuccess({ data: _agency, message: 'Agency updated' }))
    } catch (e) {
        const err = new GenericError({ error: e.message, message: 'Could not update Agency', status: 400 })
        return res.status(err.status).json(err)
    }
}

export default { 
    add,
    find,
    get,
    update
}