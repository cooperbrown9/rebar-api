import { handleError, NotFoundError } from "../../../response/index.js";

export async function authorizeGet(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params;

    try {
        if (!agencyId) {
            throw new NotFoundError('Agency not found');
        }

        if (user.agencyId.toString() !== agencyId.toString()) {
            throw new NotFoundError('Agency not found');
        }

        return next();
    } catch (e) {
        return handleError(e, res)
    }
}

export async function authorize(req, res, next) {
    console.log('QUERY HERE???', req.query)
    await authorizeGet(req, res, next);
}

export default {
    authorize: authorizeGet,
    get: authorizeGet
}