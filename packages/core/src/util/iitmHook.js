/*
 * (c) Copyright IBM Corp. 2024
 */

'use strict';

// eslint-disable-next-line instana/no-unsafe-require, import/no-extraneous-dependencies
const iitmHook = require('import-in-the-middle');
const blabla = require('../tracing/instrumentation/frameworks/blabla');

function setIitmHook() {
  console.log('blabla', blabla);
  const instrumentedModule = {
    moduleName: 'blabla',
    hookFn: blabla.instrument
  };

  // @ts-ignore
  iitmHook([instrumentedModule.moduleName], function (exports, name, basedir) {
    console.log(`Hooking enabled for module ${name} and base directory ${basedir}`);
    if (exports && exports.default) {
      // If the module has a 'default' export
      // Apply the hook function to the 'default' export
      // Return the modified module exports
      exports.default = instrumentedModule.hookFn(exports.default);
      return exports;
    } else {
      return instrumentedModule.hookFn(exports);
    }
  });
}
module.exports.setIitmHook = setIitmHook;
