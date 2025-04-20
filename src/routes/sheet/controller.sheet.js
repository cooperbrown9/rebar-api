import { APISuccess, handleError } from '../../response/index.js';
import SheetService from './service.sheet.js'

export async function add(req, res, next) {
    const { data: sheet } = req.body;

    try {
        const _sheet = await SheetService.add(sheet)
        return res.send(new APISuccess({ data: _sheet }))
    } catch (e) {
        handleError(e, res)
    }
}

export async function find(req, res, next) {
    const { query } = req;
    const { filters, options } = query;

    try {
        const _sheets = await SheetService.find(filters, options)
        return res.send(new APISuccess({ data: _sheets }))
    } catch (e) {
        handleError(e, res)
    }
}

export async function get(req, res, next) {
    const { sheetId } = req.params;

    try {
        const _sheet = await SheetService.get(sheetId)
        return res.send(new APISuccess({ data: _sheet }))
    } catch (e) {
        handleError(e, res)
    }
}

export async function update(req, res, next) {
    const { sheetId } = req.params;
    const { data: sheet } = req.body;

    try {
        const _sheet = await SheetService.update(sheetId, sheet)
        return res.send(new APISuccess({ data: _sheet }))
    } catch (e) {
        handleError(e, res)
    }
}

export default {
    add,
    find,
    get,
    update
}