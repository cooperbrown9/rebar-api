import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import User from '../user/index.js';
import { AuthorizationError } from '../../response/index.js';

dotenv.config()

const UserService = new User.Service()

/**
 * Authenticate the user by validating their JWT
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns next route with a user object on the request
 */
export async function authenticate(req, res, next) {
    if (req.url.includes('/login') || req.url.includes("/auth")) return next()
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    try {
        if (token == null) throw new AuthorizationError('No token provided')
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) //async (err, user) => {

        // Extra JWT fields that we dont need
        delete user.exp
        delete user.iat
        const freshUser = await UserService.get(user._id, { populate: 'role' })

        req.user = { ...freshUser }
        next()
    } catch (e) {
        console.log('Auth.Middleware.authenticate', e)
        return res.status(e.status || 401).json(e)
    }
}