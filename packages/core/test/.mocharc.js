'use strict';

const mochaOptions = {
  ignore: ['node_modules/**/*', 'test/**/node_modules/**/*'],
  require: 'test/testSetup.js'
};

process.env.NODE_ENV = 'test';

module.exports = mochaOptions;
