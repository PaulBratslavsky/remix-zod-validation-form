'use strict';

/**
 * form-data service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::form-data.form-data');
