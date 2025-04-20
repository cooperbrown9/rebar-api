import { RoleUtil } from "../role/index.js";

const permissions = [
    RoleUtil.createPermission('sheet', 'r', 'me'),
    RoleUtil.createPermission('sheet', 'rw', 'me'),
    RoleUtil.createPermission('sheet', 'r', 'all'),
    RoleUtil.createPermission('sheet', 'rw', 'all')
]

export default  permissions