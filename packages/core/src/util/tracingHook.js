/*
 * (c) Copyright IBM Corp. 2024
 */

'use strict';

const requireHook = require('./requireHook');
exports.init = function init(/** @type {import("./normalizeConfig").InstanaConfig} */ preliminaryConfig) {
  requireHook.init(preliminaryConfig);
  // requireHook.setupIitmHook();
};
