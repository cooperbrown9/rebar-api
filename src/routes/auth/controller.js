import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import User from '../user/index.js';
import { APISuccess, AuthorizationError, GenericError } from '../../response/index.js';

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
    if (req.url.includes('/login') || req.url.includes("/auth/token")) return next()
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    try {
        if (token == null) throw new Error('No token provided')
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) //async (err, user) => {

        // Extra JWT fields that we dont need
        delete user.exp
        delete user.iat
        const freshUser = await UserService.get(user._id, { populate: 'role' })

        req.user = { ...freshUser }
        next()
    } catch (e) {
        console.log('Auth.Controller.authenticate', e)
        return next(e)
    }
}

const refreshTokens = []
/**
 * @summary Login with an email and returns a JWT
 */
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await User.Model.findOne({ email }, 'email password _id firstName lastName').lean()

        if (!user) throw new GenericError({ message: 'User not found', status: 404 })

        const isPWCorrect = await bcrypt.compare(password, user.password);

        if (!isPWCorrect) {
            console.log('password incorrect')
            throw new GenericError({ message: 'Password incorrect', status: 401 })
        }

        delete user.password

        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        return res.json(new APISuccess({ data: { user, accessToken, refreshToken } }))
        // return res.json({ user: user, accessToken, refreshToken })
    } catch (e) {
        const err = new GenericError({ error: e.message, message: e.message || 'Could not login', status: e.status || 400 })
        return res.status(err.status).json(err)
    }
}

/**
 * @summary wrapper for generating access tokens consistantly
 */
function generateAccessToken(user) {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
    return token;
}