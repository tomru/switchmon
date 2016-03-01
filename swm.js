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

function orderDeviceKeys(selectedDevices, devices) {
    let orderedDeviceKeys = Object.keys(devices).sort();

    // fix the sort order if monitors were explicitly selected
    selectedDevices.reverse().forEach((monitor) => {
        const index = orderedDeviceKeys.indexOf(monitor);
        if (index < 0) {
            console.error('Unkown monitor', monitor, '(ignored)');
            return;
        }
        orderedDeviceKeys.splice(index, 1);
        orderedDeviceKeys.unshift(monitor);
    });

    return orderedDeviceKeys;
}

function setActivationFlag(selectedDevices, devices) {
    const result = {};

    Object.keys(devices).forEach(deviceKey => {
        const device = Object.assign({}, devices[deviceKey]);
        const isSelected = !selectedDevices.length || selectedDevices.indexOf(deviceKey) > -1;

        if (isSelected) {
            if (device.connected) {
                device.activate = true;
            } else {
                console.error(deviceKey, 'not connected. Skipping...');
            }
        }

        result[deviceKey] = device;
    });
    return result;
}

function generateXrandrOptions(selectedDevices, rawDevices) {
    let xrandrOptions = '';
    let prevDevice;
    let devices = setActivationFlag(selectedDevices, rawDevices);

    orderDeviceKeys(selectedDevices, devices).forEach(deviceKey => {
        const device = devices[deviceKey];
        const monitorOptions = ['', '--output', deviceKey];

        if (!device.activate) {
            monitorOptions.push('--off');
        } else {
            monitorOptions.push('--auto');

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
