/*
 * (c) Copyright IBM Corp. 2021
 * (c) Copyright Instana Inc. and contributors 2018
 */

'use strict';

const path = require('path');
const expect = require('chai').expect;
const semver = require('semver');

const constants = require('@instana/core').tracing.constants;
const supportedVersion = require('@instana/core').tracing.supportedVersion;
const config = require('../../../../../core/test/config');
const testUtils = require('../../../../../core/test/test_util');
const ProcessControls = require('../../../test_util/ProcessControls');
const globalAgent = require('../../../globalAgent');

const mochaSuiteFn = supportedVersion(process.versions.node) ? describe : describe.skip;

['latest', 'v4', 'v3'].forEach(version => {
  mochaSuiteFn('tracing/fastify', function () {
    this.timeout(config.getTestTimeout());

    if (version === 'latest' && semver.lt(process.versions.node, '20.0.0')) {
      it.skip(`"${version}" version requires Node.js version 20 or higher`);
      return;
    }

    describe(`${version}`, () => {
      const agentControls = globalAgent.instance;
      let processControls;

      describe('path templates', () => {
        globalAgent.setUpCleanUpHooks();

        before(async () => {
          processControls = new ProcessControls({
            appPath: path.join(__dirname, 'app'),
            useGlobalAgent: true,
            env: {
              FASTIFY_VERSION: version
            }
          });

          await processControls.startAndWaitForAgentConnection();
        });

        beforeEach(async () => {
          await agentControls.clearReceivedTraceData();
        });

        after(async () => {
          await processControls.stop();
        });

        afterEach(async () => {
          await processControls.clearIpcMessages();
        });

        check('/', 200, { hello: 'world' }, '/');
        check('/hooks', 200, { hello: 'world' }, '/hooks');
        check('/hooks-early-reply', 200, { hello: 'world' }, '/hooks-early-reply');
        check('/route', 200, { hello: 'world' }, '/route');
        check('/foo/42', 200, { hello: 'world' }, '/foo/:id');
        check('/before-handler/13', 200, { before: 'handler' }, '/before-handler/:id');
        check(
          '/before-handler-array/02',
          500,
          { statusCode: 500, error: 'Internal Server Error', message: 'Yikes' },
          '/before-handler-array/:id'
        );
        check('/sub', 200, { hello: 'world' }, '/sub');
        check('/sub/bar/42', 200, { hello: 'world' }, '/sub/bar/:id');
      });

      function check(actualPath, expectedStatusCode, expectedResponse, expectedTemplate) {
        it(`must report path templates for actual path: ${actualPath}`, () =>
          processControls
            .sendRequest({
              method: 'GET',
              path: actualPath,
              simple: false
            })
            .then(response => {
              expect(response).to.deep.equal(expectedResponse);
              return testUtils.retry(() =>
                agentControls.getSpans().then(spans => {
                  testUtils.expectAtLeastOneMatching(spans, [
                    span => expect(span.data.http.path_tpl).to.equal(expectedTemplate),
                    span => expect(span.data.http.status).to.equal(expectedStatusCode),
                    span => expect(span.data.http.url).to.equal(actualPath),
                    span => expect(span.k).to.equal(constants.ENTRY)
                  ]);
                })
              );
            }));
      }
    });
  });
});
