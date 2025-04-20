import { RoleUtil } from "../role/index.js";

const permissions = [
    RoleUtil.createPermission('user', 'r', 'me'),
    RoleUtil.createPermission('user', 'rw', 'me'),
    RoleUtil.createPermission('user', 'r', 'all'),
    RoleUtil.createPermission('user', 'rw', 'all')
]

export default  permissions