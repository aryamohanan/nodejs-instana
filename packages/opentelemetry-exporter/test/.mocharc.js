'use strict';

const mochaOptions = {
  ignore: ['node_modules/**/*', 'test/**/node_modules/**/*'],
  require: 'test/testSetup.js'
};

module.exports = mochaOptions;
