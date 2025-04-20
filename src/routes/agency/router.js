import express from 'express';
import AgencyController from './controller.js';

const router = express.Router()

router.route('/').post(AgencyController.add).get(AgencyController.find)
router.route('/:agencyId').get(AgencyController.get).put(AgencyController.update)

export default router