'use strict';

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

function generateXrandrOptions(explicitlySelectedMonitors, devices) {
    let xrandrOptions = '';
    let deviceOrder = Object.keys(devices).sort();

    // fix the sort order if monitors were explicitly selected
    explicitlySelectedMonitors.reverse().forEach((monitor) => {
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

        const activateDevice = device.connected && (!explicitlySelectedMonitors.length || explicitlySelectedMonitors.indexOf(deviceKey) > -1 );

        const deviceStatus = activateDevice ? '--auto' : '--off';
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

function executePostCmd(postCmd) {
    if (!postCmd) {
        return;
    }
    return new Promise((resolve, reject) => {
        exec(postCmd, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

module.exports.getDevices = getDevices;
module.exports.generateXrandrOptions = generateXrandrOptions;
module.exports.switchDevices = switchDevices;
module.exports.executePostCmd = executePostCmd;
