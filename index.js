#!/usr/bin/env node
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));
const xrandrParse = require('xrandr-parse');

if (argv.help || argv.h) {
    console.log(
`swm - a helper to switch connected monitors

usage: swm [monitor1 [monitor2]...] [--postCmd "<some commmand>"]

If monitor is not passed it turns on all connected devices
and lays them out next to each other in the order detected.

monitor: The string as reported by the script. If provided only
this monitor will be turned on.`
    );

    return;
}

const monitorsSelected = argv._;

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

function getDeviceStatus(deviceKey, device) {
    if (monitorsSelected.indexOf(deviceKey) > -1 && device.connected) {
        return '--auto';
    }
    return '--off';
}

function genXrandrOptions(devices) {
    var xrandrOptions = '';

    Object.keys(devices).forEach(deviceKey => {
        const device = devices[deviceKey];
        const deviceStatus = getDeviceStatus(deviceKey, device);
        xrandrOptions += ['', '--output', deviceKey, deviceStatus].join(' ');
    });

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

getDevices()
    .then(genXrandrOptions)
    .then(switchDevices)
    .then(executePostCmd)
    .catch(err => {
        console.error(err);
    });
