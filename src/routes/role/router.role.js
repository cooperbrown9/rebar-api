import { Router } from 'express';

import RoleMiddlware from './middleware/index.js';
import RoleController from './controller.role.js';

const router = Router({ mergeParams: true });

router.route('/')
    .post(
        RoleMiddlware.Authorize.add,
        RoleController.add
    )
    .get(
        RoleMiddlware.Authorize.find,
        RoleController.find
    )
router.route('/:roleId').get(RoleController.get).put(RoleController.update)

export default router