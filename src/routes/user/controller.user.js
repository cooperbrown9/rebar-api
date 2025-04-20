import UserService from './service.user.js';

import { GenericError, APISuccess, handleError } from '../../response/index.js';

class UserController {
    static instance = null

    constructor() {
        const existingInstance = UserController.instance;

        if (!existingInstance) {
            UserController.instance = this;
            this.service = new UserService()
            return this;
        }

        return existingInstance;
    }

    add = async (req, res, next) => {
        const { data: user } = req.body;

        try {
            const _user = await this.service.add({ ...user });

            return res.json(new APISuccess({ data: _user, message: 'User added' }));
        } catch (e) {
            return handleError(e, res)
        }
    }

    get = async (req, res, next) => {
        const { userId } = req.params;
        const { options } = req.query;

        try {
            const _user = await this.service.get(userId, options);
            return res.json(new APISuccess({ data: _user, message: 'User found' }));
        } catch (e) {
            const err = new GenericError({
                error: e.message,
                message: e.message || 'Could not find User',
                status: e.status || 400
            });
            return res.status(err.status).json(err);
        }
    }

    /**
     * Find all users based on query. If a program exists in the req, only return users for that program
     */
    find = async (req, res, next) => {
        let { query } = req;
        let { filters, options } = query;

        try {
            const _user = await this.service.find(filters, options);
            return res.json(new APISuccess({ data: _user, message: 'Users found' }));
        } catch (e) {
            console.log(e);
            const err = new GenericError({
                error: e.message,
                message: e.message || 'Could not find Users',
                status: e.status || 400
            });
            return res.status(err.status).json(err);
        }
    }

    search = async (req, res, next) => {
        const { query } = req;
        const { filters } = query;
        const { text, agencyId } = filters;
        try {
            const _clients = await this.service.search(agencyId, text);
            return res.send(new APISuccess({ data: _clients }));
        } catch (e) {
            const err = new GenericError({
                message: e.message,
                error: e,
                status: e.status || 400
            });
            return res.status(err.status).json(err);
        }
    }

    update = async (req, res, next) => {
        const { userId } = req.params;
        const { data: user } = req.body;

        try {
            const _user = await this.service.update(userId, user);
            return res.json(new APISuccess({ data: _user, message: 'User updated' }));
        } catch (e) {
            const err = new GenericError({
                error: e.message,
                message: e.message || 'Could not update User',
                status: e.status || 400
            });
            return res.status(err.status).json(err);
        }
    }

    me = async (req, res, next) => {
        const { user } = req;

        try {
            const _user = await this.service.me(user._id);
            return res.json(new APISuccess({ data: _user, message: 'User found' }));
        } catch (e) {
            const err = new GenericError({
                error: e.message,
                message: e.message || 'Could not find User',
                status: e.status || 400
            });
            return res.status(err.status).json(err);
        }
    }

    // myClients = async (req, res, next) => {
    //     const { user, program } = req;
    //     const { query } = req;
    //     const { filters } = query;

    //     try {
    //         let clients = [];
    //         if (filters['userId'] != null && filters['agencyId'] != null) {
    //             clients = await this.service.myClients(user._id);
    //         } else if (filters['agencyId'] != null && filters['userId'] == null) {
    //             const clientService = new BaseClientService(undefined, program);
    //             clients = await clientService.find({ ...filters });
    //         }

    //         return res.json(new APISuccess({ data: clients, message: 'Clients found' }));
    //     } catch (e) {
    //         const err = new GenericError({
    //             error: e.message,
    //             message: e.message || 'Could not find your Clients',
    //             status: e.status || 400
    //         });
    //         return res.status(err.status).json(err);
    //     }
    // }

    // setRole = async (req, res, next) => {
    //     const { userId, roleId } = req.params;

    //     try {
    //         const _user = await this.service.setRole(userId, roleId);
    //         return res.json(new APISuccess({ data: _user, message: 'User role updated' }));
    //     } catch (e) {
    //         const err = new GenericError({
    //             error: e.message,
    //             message: e.message || 'Could not update User role',
    //             status: e.status || 400
    //         });
    //         return res.status(err.status).json(err);
    //     }
    // }
}

export default UserController