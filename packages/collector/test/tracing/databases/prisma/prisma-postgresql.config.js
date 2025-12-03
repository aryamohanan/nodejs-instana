/*
 * (c) Copyright IBM Corp. 2025
 */

'use strict';

const { defineConfig, env } = require('prisma/config');

module.exports = defineConfig({
  datasource: {
    url: env('PRISMA_POSTGRES_URL')
  }
});
