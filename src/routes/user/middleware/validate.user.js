import Joi from 'joi';
import { handleError } from '../../../response/index.js';

class UserValidation {
    static instance = null

    constructor() {
        const existingInstance = UserValidation.instances;

        if (!existingInstance) {
            this.initializeSchemas();
            UserValidation.instance = this;
            return this;
        }

        return existingInstance;
    }

    initializeSchemas = () => {
        // Base user schema validation fields
        this.userSchemaValidation = {
            firstName: Joi.string().allow(''),
            lastName: Joi.string().allow(''),
            email: Joi.string().email().required().lowercase(),
            agencyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
            role: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
            password: Joi.string().min(6),
            isActive: Joi.boolean(),
            isVerified: Joi.boolean()
        };

        // Update user validation schema
        this.updateUserValidation = Joi.object({
            firstName: this.userSchemaValidation.firstName.optional(),
            lastName: this.userSchemaValidation.lastName.optional(),
            agencyId: this.userSchemaValidation.agencyId.optional(),
            role: this.userSchemaValidation.role.optional(),
            email: this.userSchemaValidation.email.optional(),
            password: this.userSchemaValidation.password.optional(),
            isActive: this.userSchemaValidation.isActive.optional(),
            isVerified: this.userSchemaValidation.isVerified.optional(),
            // roles: this.userSchemaValidation.roles.optional()
        });

        // Query validation schema
        this.queryValidation = Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            email: Joi.string().email(),
            agencyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
            isActive: Joi.boolean(),
            isVerified: Joi.boolean()
        }).default({});

        // My clients query validation schema
        this.myClientsQueryValidation = Joi.object({
            agencyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
            userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null)
        }).default({});

        // Search validation schema
        this.searchValidation = Joi.object({
            agencyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
            text: Joi.string().required()
        }).default({});

        // Options validation schema
        this.optionsValidation = Joi.object({
            sort: Joi.object().pattern(
                Joi.string(),
                Joi.any().valid('asc', 'desc', 1, -1)
            ),
            limit: Joi.number().integer().min(1).max(100).default(20),
            page: Joi.number().integer().min(1).default(1),
            populate: Joi.object().pattern(
                Joi.string(),
                Joi.any().valid('bosses', 'roles', 'clientAssignments')
            ),
        }).default({});

        // User ID validation schema
        this.userIdValidation = Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/)
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'User ID is required'
            });

        // Add user validation schema
        this.addUserValidation = Joi.object(this.userSchemaValidation)
            .required()
            .fork(['email'], (schema) => schema.required());
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    find = async (req, res, next) => {
        const { query } = req;
        try {
            const validatedQuery = this.queryValidation.validate(query, { stripUnknown: true });
            const validatedOptions = this.optionsValidation.validate(query, { stripUnknown: true, abortEarly: false });

            // Separate query filters from options
            const filters = validatedQuery.value;
            const options = validatedOptions.value;

            // Convert pagination to skip/limit
            if (options) {
                options.skip = (options.page - 1) * options.limit;
                delete options.page;
            }

            req.query = {
                filters,
                options
            };

            next();
        } catch (err) {
            handleError(err, res);
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    get = async (req, res, next) => {
        const { userId } = req.params;

        try {
            // Validate ID format
            this.userIdValidation.validate(userId);
            const validatedOptions = this.optionsValidation.validate(req.query, { stripUnknown: true, abortEarly: false });

            req.query = {
                options: validatedOptions.value
            };

            return next();
        } catch (err) {
            handleError(err, res);
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    add = async (req, res, next) => {
        const { data: user } = req.body;

        try {
            const validated = this.addUserValidation.validate(user, {
                stripUnknown: true,
                abortEarly: false
            });

            req.body.data = validated.value;
            next();
        } catch (err) {
            handleError(err, res);
        }
    }
}

export default UserValidation;