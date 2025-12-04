/*
 * (c) Copyright IBM Corp. 2025
 */

'use strict';

const { defineConfig } = require('prisma/config');
// eslint-disable-next-line no-console
console.log('--55----', process.env.PRISMA_POSTGRES_URL);
module.exports = defineConfig({
  datasource: {
    url: process.env.PRISMA_POSTGRES_URL
  }
});
