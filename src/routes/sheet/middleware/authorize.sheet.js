import { AuthorizationError, handleError } from "../../../response/index.js";
import { RoleUtil } from "../../role/index.js";

export async function authorizeAdd(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params;

    try {
        const userPermissions = user.role._permissions || new Set();

        const hasAllAccess = RoleUtil.checkPermissionMatch(
            'sheet:rw:all',
            userPermissions
        );

        if (!hasAllAccess) {
            throw new AuthorizationError('You do not have permission to create sheets.');
        }

        req.body['data'] = {
            agencyId
        }
        console.log(req.body)

        return next();
    } catch (err) {
        return handleError(err, res);
    }
}

export async function authorizeFind(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params;

    try {
        const userPermissions = user.role._permissions || new Set();

        const hasAllAccess = RoleUtil.checkPermissionMatch(
            'sheet:r:all',
            userPermissions
        );

        if (!hasAllAccess) {
            throw new AuthorizationError('You do not have permission to list sheets');
        }

        req.query['agencyId'] = agencyId;
        next();
    } catch (err) {
        return handleError(err, res);
    }
}

export async function authorizeUpdate(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params;

    try {
        const userPermissions = user.role._permissions || new Set();

        const hasAllAccess = RoleUtil.checkPermissionMatch(
            'sheet:rw:all',
            userPermissions
        );

        if (!hasAllAccess) {
            throw new AuthorizationError('You do not have permission to update sheets.');
        }

        req.body.data['agencyId'] = agencyId;

        return next();
    } catch (err) {
        return handleError(err, res);
    }
}

export async function authorizeGet(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params;

    try {
        const userPermissions = user.role._permissions || new Set();

        const hasAllAccess = RoleUtil.checkPermissionMatch(
            'sheet:r:all',
            userPermissions
        );

        if (!hasAllAccess) {
            throw new AuthorizationError('You do not have permission to get sheets');
        }

        req.query['agencyId'] = agencyId;

        return next();
    } catch (err) {
        return handleError(err, res);
    }
}

export default {
    find: authorizeFind,
    update: authorizeUpdate,
    get: authorizeGet,
    add: authorizeAdd
}