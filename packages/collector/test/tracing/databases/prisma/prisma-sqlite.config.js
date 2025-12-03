/*
 * (c) Copyright IBM Corp. 2025
 */

'use strict';

require('dotenv/config');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  }
});
