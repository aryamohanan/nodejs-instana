/*
 * (c) Copyright IBM Corp. 2021
 * (c) Copyright Instana Inc. and contributors 2018
 */

'use strict';

/* eslint-disable no-unused-vars */
const shimmer = require('../../shimmer');

const requireHook = require('../../../util/requireHook');
const tracingUtil = require('../../tracingUtil');
const httpServer = require('../protocols/httpServer');
const cls = require('../../cls');

let active = false;

exports.activate = function activate() {
  active = true;
};

exports.deactivate = function deactivate() {
  active = false;
};

exports.init = function init() {
  console.log('initiated esm-square-calculator');
  requireHook.onModuleLoad('esm-square-calculator', instrument);
};

/**
 * @param {{ calculateSquare: (...args: any[]) => any; }} orgModule
 */
function instrument(orgModule) {
  //  shimmer.wrap(blabla, 'getSample', shimExpress4Handle);
  orgModule.calculateSquare = function () {
    const number = arguments[0];
    console.log(`Calculating the sum of ${number} + ${number}`);
    return number + number;
  };
  return orgModule;
}

module.exports.instrument = instrument;
