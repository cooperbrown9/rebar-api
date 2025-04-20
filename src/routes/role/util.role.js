/**
 * @typedef {'r' | 'w' | 'rw'} Action
 */

/**
 * @typedef {'me' | 'all'} Scope
 */

/**
 * @typedef {'Activity' | 'ClientAssignment' | 'Report' | 'User'} Resource
 */

/**
 * @typedef {Object} Permission
 * @property {Resource} resource - The resource being accessed
 * @property {Action} action - The type of access
 * @property {Scope} scope - The scope of access
 */

/**
 * Creates a valid permission string
 * @param {Resource} resource - The resource to create permission for
 * @param {Action} action - The action allowed
 * @param {Scope} scope - The scope of the permission
 * @returns {string} Formatted permission string
 */
export function createPermission(resource, action, scope) {
    return `${resource}:${action}:${scope}`;
}

/**
 * Checks if a role has a specific permission
 * @param {Role} userRole - The role to check permissions for
 * @param {Resource} resource - The resource being accessed
 * @param {Action} action - The action being performed
 * @param {Scope} scope - The scope of access
 * @returns {boolean} Whether the role has the required permission
 */
export function hasPermission(userRole, resource, action, scope) {
    const requiredPermission = createPermission(resource, action, scope);

    // Check if user has the exact permission
    if (userRole.permissions.has(requiredPermission)) {
        return true;
    }

    // Check if user has a broader permission that encompasses the required one
    if (action === 'r') {
        // If user has RW permission, they can also read
        const rwPermission = createPermission(resource, 'rw', scope);
        if (userRole.permissions.has(rwPermission)) {
            return true;
        }
    }

    // Check if user has all scope when ME is required
    if (scope === 'me') {
        const allScopePermission = createPermission(resource, action, 'all');
        if (userRole.permissions.has(allScopePermission)) {
            return true;
        }
    }

    return false;
}

// Usage example
// const userRole = roles.manager;
// console.log(hasPermission(userRole, 'Activity', 'r', 'all')); // true
// console.log(hasPermission(userRole, 'User', 'w', 'all')); // false

/**
 * Checks if any of the user's permissions match the required permission
 * @param {string} requiredPermission - The permission string to check for (e.g., 'Activity:R:all')
 * @param {Set<string>} myPermissions - Set of permission strings the user has
 * @returns {boolean} Whether the user has matching permission
 */
export function checkPermissionMatch(requiredPermission, myPermissions) {
    // Parse the required permission
    const [resource, action, scope] = requiredPermission.split(':');

    // Check each permission the user has
    return Array.from(myPermissions).some(permission => {
        const [myResource, myAction, myScope] = permission.split(':');

        // Resource must match exactly
        if (myResource !== resource) {
            return false;
        }

        // Check action compatibility
        // RW includes R, otherwise actions must match exactly
        const hasMatchingAction = myAction === action || (action === 'r' && myAction === 'rw');

        if (!hasMatchingAction) {
            return false;
        }

        // Check scope compatibility
        const hasMatchingScope =
            myScope === scope || // Exact match
            (scope === 'me' && myScope === 'all'); // all scope includes ME

        return hasMatchingScope;
    });
}
