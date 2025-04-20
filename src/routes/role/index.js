import Router from './router.role.js';
import Controller from './controller.role.js';
import Service from './service.role.js';
import Model from './model.role.js';
import * as Util from './util.role.js';

const Role = {
    Router,
    Controller,
    Service,
    Model,
    Util
}

export default Role

export { Service as RoleService, Util as RoleUtil }