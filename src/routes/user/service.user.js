import { NotFoundError } from '../../response/index.js';
import Role from '../role/index.js';
import User from './model.user.js';
import bcrypt from 'bcrypt';

class UserService {
    static instance = null

    constructor() {
        const existingInstance = UserService.instance

        if (!existingInstance) {
            this.model = User;
            UserService.instance = this;
            return this;
        }

        return existingInstance;
    }

    /**
     * Creates a new user
     * @param {Object} user - User data
     * @returns {Promise<Object>} The created user
     */
    add = async (user) => {
        return await this.model.create(user);
    }

    /**
     * Gets a user by ID
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} The user
     */
    get = async (userId, options) => {
        let user = await this.model.findById(userId, null, { ...options }).lean();

        if (!user) throw NotFoundError('User');

        return user;
    }

    /**
     * Finds the first user matching the query
     * @param {Object} query - Search criteria
     * @returns {Promise<Object>} The found user
     */
    findFirst = async (query) => {
        return await this.model.findOne({ ...query });
    }

    /**
     * Updates a user
     * @param {string} userId - User ID
     * @param {Object} user - Updated user data
     * @returns {Promise<Object>} The updated user
     */
    update = async (userId, user) => {
        return await this.model.findByIdAndUpdate(
            userId,
            { $set: { ...user } },
            { new: true }
        );
    }

    /**
     * Queries all users with filters
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of users
     */
    find = async (filters, options) => {
        return await this.model.find(filters, null, options);
    }

    /**
     * Searches for users by name within an agency
     * @param {string} agencyId - Agency ID
     * @param {string} text - Search text
     * @returns {Promise<Array>} List of matching users
     */
    search = async (agencyId, text) => {
        return await this.model.find({
            agencyId,
            $or: [
                { firstName: { $regex: text, $options: 'i' } },
                { lastName: { $regex: text, $options: 'i' } }
            ]
        })
    }

    /**
     * Sets a role for a user
     * @param {string} userId - User ID
     * @param {string} roleId - Role ID
     */
    setRole = async (userId, roleId) => {
        const role = await Role.Service.get(roleId);

        if (!role) throw new NotFoundError('Role not found');

        await this.model.findByIdAndUpdate(
            userId,
            { $set: { roleId: roleId } }
        );
    }

    /**
     * Updates a user's password
     * @param {string} userId - User ID
     * @param {string} password - New password
     * @returns {Promise<Object>} The updated user
     */
    updatePassword = async (userId, password) => {
        const hash = await bcrypt.hash(password, 10);
        return await this.model.findByIdAndUpdate(
            userId,
            { $set: { password: hash, isActive: true } },
            { new: true }
        );
    }

    /**
     * Gets the current user with populated agency and role
     * @param {string} userId - User ID
     * @returns {Promise<Object>} The user with populated agency and role
     */
    me = async (userId) => {
        const user = await this.model.findById(userId).populate('agencyId roleId').lean();

        if (!user) throw new NotFoundError('User not found');

        return user;
    }
}

export default UserService