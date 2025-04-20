import { AuthorizationError, handleError } from '../../../response/index.js';
import * as RoleUtil from '../util.role.js';

export async function authorizeFind(req, res, next) {
    const { user } = req;

    try {
        const programPermissions = user.role._permissions || new Set();

        const hasAllAccess = RoleUtil.checkPermissionMatch(
            'user:r:all',
            programPermissions
        );

        if (!hasAllAccess) {
            throw new AuthorizationError('You do not have permission to list youth');
        }

        if (program) {
            req.query['program'] = program;
        }
        req.query['agencyId'] = user.agencyId.toString();

        return next();
    } catch (err) {
        return handleError(err, res);
    }
}

export async function authorizeAdd(req, res, next) {
    const { user } = req;
    const { agencyId } = req.params
    console.log(agencyId)

    try {
        const hasPermission = RoleUtil.checkPermissionMatch(
            'user:rw:all',
            user.role._permissions
        );

        if (!hasPermission) {
            throw new AuthorizationError('You do not have permission to add youth');
        }

        req.body.data['agencyId'] = agencyId

        return next();
    } catch (e) {
        return handleError(e, res);
    }
}

const Authorize = {
    add: authorizeAdd,
    find: authorizeFind
}

export default Authorize;