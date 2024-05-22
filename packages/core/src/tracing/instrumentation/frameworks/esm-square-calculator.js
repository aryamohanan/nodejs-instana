/*
 * (c) Copyright IBM Corp. 2021
 * (c) Copyright Instana Inc. and contributors 2018
 */

'use strict';

/* eslint-disable no-unused-vars */
const shimmer = require('../../shimmer');
const { EXIT } = require('../../constants');
const requireHook = require('../../../util/requireHook');
const tracingUtil = require('../../tracingUtil');
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
 * @returns The instrumented module.
 */
function instrument(orgModule) {
  const originalCalculateSquare = orgModule.calculateSquare;

  orgModule.calculateSquare = function () {
    const number = arguments[0];
    console.log(`Calculating the square of ${number}`);

    return cls.ns.runAndReturn(() => {
      const span = cls.startSpan('calculator', EXIT);
      span.ts = Date.now();
      span.stack = tracingUtil.getStackTrace(instrument, 1);

      try {
        span.d = Date.now() - span.ts;
        span.data.calculator = { number: number, method: 'calculateSquare' };
        span.transmit();
        return number + number;
      } catch (err) {
        span.ec = 1;
        span.data.calculator.error = err.message;
        span.d = Date.now() - span.ts;
        span.transmit();
        throw err;
      }
    });
  };

  return orgModule;
}

module.exports.instrument = instrument;
