'use strict';

const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

describe('swm', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('getDevices', () => {
        let execStub;
        let xrandrParseStub;
        let swm;

        beforeEach(() => {
            execStub = sandbox.stub();
            xrandrParseStub = sandbox.stub();
            swm = proxyquire('../swm.js', {
                child_process: {
                    exec: execStub
                },
                'xrandr-parse': xrandrParseStub
            });
        });

        it('calls exec', () => {
            swm.getDevices();

            assert.equal(execStub.callCount, 1);
            assert.equal(execStub.args[0][0], 'xrandr');
        });

        it('returns promise', () => {
            const devices = swm.getDevices();
            assert.equal(typeof devices.then, 'function');
            assert.equal(typeof devices.catch, 'function');
        });

        it('rejects when exec passes error', (done) => {
            const devices = swm.getDevices();
            const cb = execStub.args[0][1];
            cb('some error');

            return devices.catch((err) => {
                assert.equal(xrandrParseStub.callCount, 0);
                assert.equal(err, 'some error');
                done();
            });

        });

        it('parses result', (done) => {
            xrandrParseStub.returns('some result');
            const devices = swm.getDevices();
            const cb = execStub.args[0][1];
            cb(null, 'stdout');

            return devices.then((result) => {
                assert.equal(xrandrParseStub.args[0][0], 'stdout');
                assert.equal(xrandrParseStub.callCount, 1);
                assert.equal(result, 'some result');
                done();
            });
        });
    });

    describe('generateXrandrOptions', () => {
        let swm;
        let devices;

        beforeEach(() => {
            devices = {
                'HDMI1': {
                    connected: true
                },
                'HDMI2': {
                    connected: true,
                },
                'LVDS1': {
                    connected: false
                },
                'DP1': {
                    connected: true,
                }
            }
            swm = require('../swm.js');

        });

        describe('activation of monitor', () => {
            it('for connected monitors if non is selected', () => {
                const result = swm.generateXrandrOptions([], devices);
                assert(result.indexOf('--output HDMI1 --auto') > -1);
                assert(result.indexOf('--output HDMI2 --auto') > -1);
                assert(result.indexOf('--output LVDS1 --off') > -1);
            });
            it('for connected selected monitors', () => {
                const result = swm.generateXrandrOptions(['HDMI2'], devices);
                assert(result.indexOf('--output HDMI1 --off') > -1);
                assert(result.indexOf('--output HDMI2 --auto') > -1);
                assert(result.indexOf('--output LVDS1 --off') > -1);
            });
            it('skipps selected monitors that are not connected', () => {
                const result = swm.generateXrandrOptions(['LVDS1', 'HDMI2'], devices);
                assert(result.indexOf('--output HDMI2 --auto') > -1);
                assert(result.indexOf('--output LVDS1 --off') > -1);
            });
        });

        it('aligns monitor n to the right of monitor n-1', () => {
            const result = swm.generateXrandrOptions(['HDMI1', 'HDMI2', 'DP1'], devices);
            assert(result.indexOf('--output HDMI1 --auto') > -1);
            assert(result.indexOf('--output HDMI2 --auto --right-of HDMI1') > -1);
            assert(result.indexOf('--output DP1 --auto --right-of HDMI2') > -1);
        });

        it('throws when no selected monitor is connected', () => {
            assert.throws(() => {swm.generateXrandrOptions(['LVDS1'], devices)});
            assert.throws(() => {swm.generateXrandrOptions(['BOGUS'], devices)});
            devices = {};
            assert.throws(() => {swm.generateXrandrOptions([], devices)});
        });
    });

    describe('switchDevices', () => {
        let execStub;
        let swm;

        beforeEach(() => {
            execStub = sandbox.stub();
            swm = proxyquire('../swm.js', {
                child_process: {
                    exec: execStub
                }
            });
        });

        it('calls exec with xrandr and opitons', () => {
            swm.switchDevices('[some options]');

            assert.equal(execStub.callCount, 1);
            assert.equal(execStub.args[0][0], 'xrandr [some options]');
        });

        it('returns promise', () => {
            const promise = swm.switchDevices('[some options]');
            assert.equal(typeof promise.then, 'function');
            assert.equal(typeof promise.catch, 'function');
        });

        it('rejects when exec passes error', (done) => {
            const promise = swm.switchDevices('[some options]');
            const cb = execStub.args[0][1];
            cb('some error');

            return promise.catch((err) => {
                assert.equal(err, 'some error');
                done();
            });
        });
    });

    describe('executePostCmd', function() {
        let execStub;
        let swm;

        beforeEach(() => {
            execStub = sandbox.stub();
            swm = proxyquire('../swm.js', {
                child_process: {
                    exec: execStub
                }
            });
        });

        it('calls postCmd', () => {
            swm.executePostCmd('[some cmd]');

            assert.equal(execStub.callCount, 1);
            assert.equal(execStub.args[0][0], '[some cmd]');
        });

        it('returns promise', () => {
            const promise = swm.executePostCmd('[some cmd]');
            assert.equal(typeof promise.then, 'function');
            assert.equal(typeof promise.catch, 'function');
        });

        it('rejects when exec passes error', (done) => {
            const promise = swm.executePostCmd('[some cmd]');
            const cb = execStub.args[0][1];
            cb('some error');

            return promise.catch((err) => {
                assert.equal(err, 'some error');
                done();
            });
        });
    });
});

