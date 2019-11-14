'use strict';

const xrandrParse = require('xrandr-parse');
const exec = require('child_process').exec;

function executeCmd(cmd, callback) {
    exec(cmd, callback);
}

function getDevices(callback) {
    executeCmd('xrandr', (err, stdout) =>
        callback(err, err ? null : xrandrParse(stdout))
    );
}

function switchDevices(xrandrOptions, callback) {
    executeCmd('xrandr ' + xrandrOptions, callback);
}

function executePostCmd(postCmd, callback) {
    executeCmd(postCmd, callback);
}

function orderDeviceKeys(selectedDevices, devices) {
    let orderedDeviceKeys = Object.keys(devices).sort();

    // fix the sort order if monitors were explicitly selected
    selectedDevices.reverse().forEach(monitor => {
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
    const selectByDefault = selectedDevices.length === 0;

    Object.keys(devices).forEach(deviceKey => {
        const device = Object.assign({}, devices[deviceKey]);
        const isSelected = selectedDevices.indexOf(deviceKey) > -1;

        if (isSelected || selectByDefault) {
            if (device.connected) {
                device.activate = true;
            } else if (isSelected) {
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
        throw new Error('Non of the given monitors are connected, aborting...');
    }

    return xrandrOptions;
}

module.exports.getDevices = getDevices;
module.exports.generateXrandrOptions = generateXrandrOptions;
module.exports.switchDevices = switchDevices;
module.exports.executePostCmd = executePostCmd;
