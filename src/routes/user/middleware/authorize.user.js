// import * as UserService from '../service.user.js';
import Role from '../../role/index.js';
import { AuthorizationError, NotFoundError } from '../../../response/index.js';

/**
 * @typedef {import('../../../types/index').AuthenticatedRequest} Request
 * @typedef {import('../../../types/index').Response} Response
 * @typedef {import('../../../types/index').NextFunction} NextFunction
 * @typedef {import('../../../types/index').UserModel} User
 */

class UserAuthorization {
    static instance

    constructor() {
        const existingInstance = UserAuthorization.instance

        if (!existingInstance) {
            UserAuthorization.instance = this;
            return this;
        }

        return existingInstance;
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    get = async (req, res, next) => {
        const { user: sessionUser, program } = req;
        const { userId: targetUserId } = req.params;

        try {
            // const hasPermission = Role.Util.checkPermissionMatch(
            //     'user:r:all',
            //     sessionUser.roles[program].permissions
            // )

            // if (!hasPermission && sessionUser._id.toString() !== targetUserId) {
            //     throw new AuthorizationError('You do not have permission to view this user');
            // }

            // const targetUser = await UserService.get(targetUserId);
            // if (targetUser.agencyId.toString() !== sessionUser.agencyId.toString()) {
            //     throw new AuthorizationError('User does not belong to your agency');
            // }

            return next();
        } catch (e) {
            return res.status(e?.status || 400).json(new AuthorizationError('Cannot validate get user', e));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    find = async (req, res, next) => {
        const { user: sessionUser, program } = req;

        try {
            // const hasPermission = Role.Util.checkPermissionMatch(
            //     'user:r:all',
            //     sessionUser.roles[program]?.permissions || new Set()
            // );

            // if (!hasPermission) {
            //     throw new AuthorizationError('You do not have permission to query users');
            // }

            // req.query['agencyId'] = sessionUser.agencyId.toString();
            // req.query['program'] = program;

            return next();
        } catch (e) {
            return res.status(e.status).json(e);
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    add = async (req, res, next) => {
        const { user: sessionUser, program } = req;
        const { agencyId } = req.params;

        try {
            const hasPermission = Role.Util.checkPermissionMatch(
                'user:rw:all',
                sessionUser.roles[program].permissions
            )

            if (!hasPermission) {
                throw new AuthorizationError('You do not have permission to view this user');
            }

            req.body.data['agencyId'] = agencyId;
            console.log(req.body.data)

            return next();
        } catch (e) {
            console.log(e)
            return res.status(e.status || 400).json(e);
        }
    }
}

// Create a default instance
export default UserAuthorization;