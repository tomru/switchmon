'use strict';

const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

describe('config', () => {
    let sandbox;
    let consoleLogSpy;
    let xdgBasedirConfigStub;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        consoleLogSpy = sandbox.spy(console, 'log');
        xdgBasedirConfigStub = sandbox.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('loads config if existent', () => {
        xdgBasedirConfigStub.returns('./some_config.json');

        const config = proxyquire('../config.js', {
            'xdg': {
                basedir: {
                    configPath: xdgBasedirConfigStub
                }
            },
            './some_config.json': {
                postCmd: '[some postCmd]',
                profiles: {
                    profile1: ['HDMI1', 'HDMI2'],
                    profile2: ['LVDS1']
                }
            }
        });
        assert.equal(config.postCmd, '[some postCmd]');
        assert.deepEqual(config.profiles.profile1, ['HDMI1', 'HDMI2']);
        assert.deepEqual(config.profiles.profile2, ['LVDS1']);
    });

    it('uses defaults if not existent', () => {
        xdgBasedirConfigStub.returns('./not_existing_config.json');

        const config = proxyquire('../config.js', {
            'xdg': {
                basedir: {
                    configPath: xdgBasedirConfigStub
                }
            }
        });
        assert.equal(config.postCmd, undefined);
        assert.equal(Object.keys(config.profiles).length, 0);
    });
});
