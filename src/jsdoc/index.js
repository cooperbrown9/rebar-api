/**
 * Request -----------------------------------------------------------------------------------------------------------
 */
/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').NextFunction} NextFunction
 * 
 */

/**
 * @typedef {Object} AuthenticatedRequestExtensions
 * @property {User} user - The authenticated user
 * @property {string} program - Program identifier added by middleware
 */

/**
 * @typedef {Object} RequestBody
 */

/**
 * @typedef {Object} RequestQuery
 * @property {string} [status]
 * @property {string} [type]
 */

/**
 * @typedef {AuthenticatedRequest & {file: MulterFile}} AuthenticatedRequestWithFile
 */

/**
 * @typedef {Object} RequestParams
 */

/**
 * @typedef {ExpressRequest & AuthenticatedRequestExtensions} AuthenticatedRequest
 */


/**
 * User --------------------------------------------------------------------------------------------------------------
 */

/**
* @typedef {Object} Address
* @property {string} street
* @property {string} city
* @property {string} state  
* @property {string} zip
*/

/**
* @typedef {Object} Role
* @property {string} _id
* @property {string} name
* @property {string} description
* @property {('lifeset'|'brs'|'global')} program
* @property {string} agencyId
* @property {string[]} _permissions
* @property {boolean} isActive
* @property {Date} createdAt
* @property {Date} updatedAt
* @property {Set<string>} permissions
*/

/**
* @typedef {Object} ClientAssignment
* @property {string} _id
* @property {string} userId
* @property {string} clientId
*/

/**
* @typedef {Object} User
* @property {string} _id
* @property {string} firstName
* @property {string} lastName
* @property {string} email
* @property {string} phone
* @property {string} agencyId
* @property {Map<string, Role>} roles
* @property {string} password
* @property {Address} address
* @property {boolean} isActive
* @property {boolean} isVerified
* @property {Date} createdAt
* @property {Date} updatedAt
* @property {ClientAssignment[]} clientAssignments
*/

/**
* @typedef {import('mongoose').Document & User} User
*/

/**
* Mongoose User Model
// * @typedef {import('mongoose').Model<UserDocument>} UserModel
*/

/**
 * MISC --------------------------------------------------------------------------------------------------------------
 */

/** 
 * @typedef {Object} MulterFile
 * @property {string} fieldname - Field name from the form
 * @property {string} originalname - Original file name
 * @property {string} encoding - File encoding
 * @property {string} mimetype - MIME type
 * @property {Buffer} buffer - File data
 * @property {number} size - File size in bytes
 */

export default {}