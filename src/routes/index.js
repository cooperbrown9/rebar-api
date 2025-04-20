import express from 'express';
import Auth from './auth/index.js';
import Agency from './agency/index.js';
import Role from './role/index.js';
import Sheet from './sheet/index.js';
import User from './user/index.js';

const router = express.Router()

const UserRouter = new User.Router()

router.use('/auth',
    Auth.Router
)

router.use('/agency',
    Agency.Router
)

/**
 * User Router
 * @middleware verify user has access to this agency
 */
router.use('/agency/:agencyId/user',
    Agency.Middleware.Authorize.authorize,
    UserRouter.getRouter()
)

/**
 * Role Router
 * @middleware verify user has access to this agency
 */
router.use('/agency/:agencyId/role',
    Agency.Middleware.Authorize.authorize,
    Role.Router
)

/**
 * Sheet Router
 * @middleware verify user has access to this agency
 */
router.use('/agency/:agencyId/sheet',
    Agency.Middleware.Authorize.authorize,
    Sheet.Router
)

export default router