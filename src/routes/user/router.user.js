import express from 'express';
import UserController from './controller.user.js';
import UserMiddleware from './middleware/index.js';

class UserRouter {
    static instance = null

    constructor() {
        const existingInstance = UserRouter.instance;

        if (!existingInstance) {
            this.router = express.Router({ mergeParams: true });

            this.authorization = new UserMiddleware.Authorize();
            this.validation = new UserMiddleware.Validate();
            this.controller = new UserController()

            this.initializeRoutes();
            UserRouter.instance = this;
            return this;
        }

        return existingInstance;
    }

    initializeRoutes = () => {
        this.initializeRootRoutes();
        this.initializeMeRoutes();
        this.initializeUserIdRoutes();
    }

    initializeRootRoutes = () => {
        this.router.route('/')
            .post(
                this.authorization.add,
                this.validation.add,
                this.controller.add
            )
            .get(
                this.authorization.find,
                this.validation.find,
                this.controller.find
            );
    }

    initializeMeRoutes = () => {
        this.router.route('/me')
            .get(this.controller.me);
    }

    initializeUserIdRoutes = () => {
        this.router.route('/:userId')
            .get(
                this.authorization.get,
                this.validation.get,
                this.controller.get
            )
    }

    getRouter = () => {
        return this.router;
    }
}

export default UserRouter