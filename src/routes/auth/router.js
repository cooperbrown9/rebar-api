import express from 'express';
import * as AuthController from './controller.js';

const router = express.Router()

router.route('/').post(AuthController.authenticate, (req, res, next) => res.json({ user: req.user }))
router.route('/login').post(AuthController.login)

export default router