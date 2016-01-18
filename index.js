#!/usr/bin/env node
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const xrandrParse = require('xrandr-parse');
const exec = require('child_process').exec;

function getDevices() {
    return new Promise((resolve, reject) => {
        exec('xrandr', (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err);
                return;
            }
            resolve(xrandrParse(stdout));
        });
    });
}

function generateXrandrOptions(monitorList, devices) {
    let xrandrOptions = '';
    let deviceOrder = Object.keys(devices).sort();

    // remove explicitly selected monitors inside the array and add them to the
    // beginning in the order they have been specified.
    monitorList.reverse().forEach((monitor) => {
        const index = deviceOrder.indexOf(monitor);
        if (index < 0) {
            console.error('Unkown monitor', monitor, '(ignored)');
            return;
        }
        deviceOrder.splice(index, 1);
        deviceOrder.unshift(monitor);
    });

    let prevDevice;
    deviceOrder.forEach(deviceKey => {
        const device = devices[deviceKey];

        const deviceStatus = device.connected ? '--auto' : '--off';
        const monitorOptions = ['', '--output', deviceKey, deviceStatus];

        if (device.connected) {
            if (prevDevice) {
                monitorOptions.push(['--right-of', prevDevice].join(' '));
            }

            prevDevice = deviceKey;
        }
        xrandrOptions += monitorOptions.join(' ');
    });

    // sanity check if at least one monitor is on
    if (xrandrOptions.indexOf('--auto') === -1) {
        throw 'Non of the given monitors are connected, aborting...';
    }

    return xrandrOptions;
}

function switchDevices(xrandrOptions) {
    return new Promise((resolve, reject) => {
        const cmd = 'xrandr ' + xrandrOptions;
        exec(cmd, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function executePostCmd() {
    if (!argv.postCmd) {
        return;
    }
    return new Promise((resolve, reject) => {
        exec(argv.postCmd, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (argv.help || argv.h) {
    console.log(
`Simple helper for turning on/off connected/disconnected monitors with 'xrandr'.

Usage:

'swm [monitor-1...montior-n]' e.g. 'swm LVDS1 HDMI1'

If 'monitor-1' to 'monitor-n' is specified 'swm' will turn on these monitors
and place them from left to right in the order given. If a provided monitor is
not connected it will be skipped.

If no monitors are specified all connected monitors will be turned on and
placed from left to right in alphabetical order of their name.`
    );

    process.exit(2);
}

getDevices()
    .then(generateXrandrOptions.bind(null, argv._))
    .then(switchDevices)
    .then(executePostCmd)
    .catch(err => {
        console.error(err);
    });
