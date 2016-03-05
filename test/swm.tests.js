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
});

