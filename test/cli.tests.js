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

        proxyquire('../cli.js', {
            'minimist': minimistStub,
            './swm.js': {
                getDevices: getDevicesStub
            }
        });
        getDevicesStub.args[0][0](null, {
            LVDS1: {connected: true},
            HDMI2: {connected: false}
        });

        assert.equal(getDevicesStub.callCount, 1);
        assert.equal(consoleLogSpy.callCount, 3);
        assert.equal(consoleLogSpy.args[0][0], 'Detected devices:\n');
        assert.equal(consoleLogSpy.args[1].join(' '), 'LVDS1: Connected');
        assert.equal(consoleLogSpy.args[2].join(' '), 'HDMI2: Disconnected');
    });

    describe('switching', () => {
        let minimistStub;
        let selectedMonitors;
        let deviceData;
        let getDevicesStub;
        let generateXrandrOptionsStub;
        let switchDevicesStub;
        let executePostCmdStub;

        beforeEach(() => {
            selectedMonitors = ['LVDS1'];
            minimistStub = sandbox.stub();
            minimistStub.returns({
                _: selectedMonitors,
                postCmd: '[some post cmd]'
            });

            deviceData = {
                LVDS1: {connected: true},
                HDMI2: {connected: false}
            };

            getDevicesStub = sandbox.stub();
            generateXrandrOptionsStub = sandbox.stub().returns('[some xrandr options]');
            switchDevicesStub = sandbox.stub();
            executePostCmdStub = sandbox.stub();

            const cli = proxyquire('../cli.js', {
                'minimist': minimistStub,
                './swm.js': {
                    getDevices: getDevicesStub,
                    generateXrandrOptions: generateXrandrOptionsStub,
                    switchDevices: switchDevicesStub,
                    executePostCmd: executePostCmdStub
                },
                './config.js': {}
            });

            getDevicesStub.args[0][0](null, deviceData);
        });

        it('calls getDevices', () => {
            assert.equal(getDevicesStub.callCount, 1, 'calls device stub');
        });

        it('calls generateXrandrOptions', () => {
            assert.equal(generateXrandrOptionsStub.callCount, 1, 'calls generateXrandrOptions');
            assert.equal(generateXrandrOptionsStub.args[0][0], selectedMonitors);
        });

        it('calls switchDevices', () => {
           assert.equal(switchDevicesStub.callCount, 1);
           assert.equal(switchDevicesStub.args[0][0], '[some xrandr options]');
        });

        it('calls executePostCmd', () => {
           assert.equal(executePostCmdStub.callCount, 1);
           assert.equal(executePostCmdStub.args[0][0], '[some post cmd]');
        });
    });
});

