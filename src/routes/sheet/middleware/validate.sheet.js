import Joi from 'joi';
import { handleError } from '../../../response/index.js';

const ShapeValidationSchema = Joi.object({
    type: Joi.string().required(),
    x: Joi.number(),
    y: Joi.number(),
    radius: Joi.number(),
    width: Joi.number(),
    height: Joi.number(),
    innerRadius: Joi.number(),
    outerRadius: Joi.number(),
    fill: Joi.string()
}).unknown(true); // Allows for flexible properties

const ObjectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const VersionValidationSchema = Joi.object().pattern(
    Joi.string(), // Key can be any string
    ShapeValidationSchema // Value must match ShapeValidationSchema
);

const SheetValidationSchema = Joi.object({
    name: Joi.string().default('sheet-' + Date.now().toString()),
    agencyId: Joi.string().required(),
    versions: Joi.array().items(VersionValidationSchema),
    currentVersion: Joi.number().default(0)
});

const SheetValidationFindSchema = Joi.object({
    agencyId: Joi.string().required()
});

const SheetValidationAddSchema = Joi.object({
    name: Joi.string().default('sheet-' + Date.now().toString()).allow(null, ''),
    agencyId: Joi.string().required(),
});

const OptionsSchema = Joi.object({
    limit: Joi.number().integer().min(1).default(10),
    skip: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).default(1),
    sort: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives().try(Joi.number().valid(1, -1), Joi.string().valid('asc', 'desc'))
    )
});

export async function validateFind(req, res, next) {
    const { query } = req;

    try {
        console.log('QUERY', query)
        const filters = await SheetValidationFindSchema.validateAsync(query, { stripUnknown: true });
        const options = await OptionsSchema.validateAsync(query, { stripUnknown: true });
        req.query = { filters, options };
        console.log(filters)

        return next();
    }
    catch (err) {
        return handleError(err, res)
    }
}

export async function validateUpdate(req, res, next) {
    const { data } = req.body;

    try {
        const sheet = await SheetValidationSchema.validateAsync(data, { stripUnknown: true });

        req.body.data = sheet;

        return next();
    }
    catch (err) {
        return handleError(err, res)
    }
}

export async function validateAdd(req, res, next) {
    const { data } = req.body;
    console.log('here', data)
    try {
        await SheetValidationAddSchema.validateAsync(data, { stripUnknown: true });

        return next();
    }
    catch (err) {
        return handleError(err, res)
    }
}

export async function validateGet(req, res, next) {
    const { sheetId } = req.params;

    try {
        await ObjectIdSchema.validateAsync(sheetId, { stripUnknown: true });

        // If no error, then user is all good. Just need to validate that its a valid ID

        return next();
    }
    catch (err) {
        return handleError(err, res)
    }
}

export default {
    find: validateFind,
    update: validateUpdate,
    add: validateAdd,
    get: validateGet
}