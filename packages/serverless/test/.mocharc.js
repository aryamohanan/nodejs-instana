'use strict';

const mochaOptions = {
  require: 'test/testSetup.js',
  ignore: ['node_modules/**/*', 'test/**/node_modules/**/*']
};
module.exports = mochaOptions;
