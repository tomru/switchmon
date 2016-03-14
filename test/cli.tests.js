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

    afterEach(() => {
        sandbox.restore();
    });

    it('shows help', () => {
        const minimistStub = sandbox.stub();
        minimistStub.returns({h: true});

        const cli = proxyquire('../cli.js', {
            'minimist': minimistStub,
            './usage.js': '[usage]'
        });
        assert.equal(consoleLogSpy.callCount, 1);
        assert.equal(consoleLogSpy.args[0][0], '[usage]');
    });

    describe('device list', () => {
        let minimistStub, getDevicesStub;

        beforeEach(() => {
            minimistStub = sandbox.stub();
            minimistStub.returns({l: true});
            getDevicesStub = sandbox.stub();

            proxyquire('../cli.js', {
                'minimist': minimistStub,
                './swm.js': {
                    getDevices: getDevicesStub
                }
            });
        });

        it('lists devices', () => {
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

        it('throws error when listing devices fails', () => {
            assert.throws(() => {
                getDevicesStub.args[0][0]('[some err]');
            }, /some err/);
        });
    });

    describe('switching', () => {
        let minimistStub;
        let deviceData;
        let getDevicesStub;
        let generateXrandrOptionsStub;
        let switchDevicesStub;
        let executePostCmdStub;

        beforeEach(() => {
            minimistStub = sandbox.stub();
            minimistStub.returns({
                _: ['LVDS1'],
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
        });

        it('calls getDevices', () => {
            getDevicesStub.args[0][0](null, deviceData);
            assert.equal(getDevicesStub.callCount, 1, 'calls device stub');
        });

        it('throws error when getDevices fails', () => {
            assert.throws(() => {
                getDevicesStub.args[0][0]('[some err]');
            }, /some err/);
        });

        it('calls generateXrandrOptions', () => {
            getDevicesStub.args[0][0](null, deviceData);
            assert.equal(generateXrandrOptionsStub.callCount, 1, 'calls generateXrandrOptions');
            assert.deepEqual(generateXrandrOptionsStub.args[0][0], ['LVDS1']);
        });

        it('calls switchDevices', () => {
            getDevicesStub.args[0][0](null, deviceData);
            assert.equal(switchDevicesStub.callCount, 1);
            assert.equal(switchDevicesStub.args[0][0], '[some xrandr options]');
        });

        it('calls executePostCmd', () => {
            getDevicesStub.args[0][0](null, deviceData);
            assert.equal(executePostCmdStub.callCount, 1);
            assert.equal(executePostCmdStub.args[0][0], '[some post cmd]');
        });
    });

    describe('switching with profiles', () => {
        let minimistStub;
        let deviceData;
        let getDevicesStub;
        let generateXrandrOptionsStub;
        let switchDevicesStub;
        let executePostCmdStub;

        beforeEach(() => {
            minimistStub = sandbox.stub();
            minimistStub.returns({
                _: ['LVDS1'],
                postCmd: '[some post cmd]',
                profile: 'profile1'
            });

            deviceData = {
                LVDS1: {connected: true},
                HDMI2: {connected: false}
            };

            getDevicesStub = sandbox.stub();
            generateXrandrOptionsStub = sandbox.stub().returns('[some xrandr options]');
            switchDevicesStub = sandbox.stub();
            executePostCmdStub = sandbox.stub();

            proxyquire('../cli.js', {
                'minimist': minimistStub,
                './swm.js': {
                    getDevices: getDevicesStub,
                    generateXrandrOptions: generateXrandrOptionsStub,
                    switchDevices: switchDevicesStub,
                    executePostCmd: executePostCmdStub
                },
                './config.js': {
                    profiles: {
                        profile1: ['HDMI1', 'HDMI2']
                    }
                }
            });
        });

        it('calls generateXrandrOptions with profile settings', () => {
            getDevicesStub.args[0][0](null, deviceData);
            assert.equal(generateXrandrOptionsStub.callCount, 1, 'calls generateXrandrOptions');
            assert.deepEqual(generateXrandrOptionsStub.args[0][0], ['HDMI1', 'HDMI2']);
        });
    });
});

