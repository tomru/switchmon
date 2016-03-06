'use strict';

const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

describe('cli', () => {
    let sandbox;
    let consoleLogSpy;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        consoleLogSpy = sandbox.spy(console, 'log');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('shows help', function() {
        const minimistStub = sandbox.stub();
        minimistStub.returns({h: true});

        const cli = proxyquire('../cli.js', {
            'minimist': minimistStub,
            './usage.js': '[usage]'
        });
        assert.equal(consoleLogSpy.callCount, 1);
        assert.equal(consoleLogSpy.args[0][0], '[usage]');
    });

    it('lists devices', function() {
        const minimistStub = sandbox.stub();
        minimistStub.returns({l: true});
        const getDevicesStub = sandbox.stub();
        getDevicesStub.returns({
            then: cb => cb({
                LVDS1: {connected: true},
                HDMI2: {connected: false}
            })
        });

        const cli = proxyquire('../cli.js', {
            'minimist': minimistStub,
            './swm.js': {
                getDevices: getDevicesStub
            }
        });
        assert.equal(getDevicesStub.callCount, 1);
        assert.equal(consoleLogSpy.callCount, 3);
        assert.equal(consoleLogSpy.args[0][0], 'Detected devices:\n');
        assert.equal(consoleLogSpy.args[1].join(' '), 'LVDS1: Connected');
        assert.equal(consoleLogSpy.args[2].join(' '), 'HDMI2: Disconnected');
    });
});

