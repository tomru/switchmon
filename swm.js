'use strict';

const xrandrParse = require('xrandr-parse');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getDevices() {
    const { stdout } = await exec('xrandr');
    return xrandrParse(stdout);
}

function sortDeviceKeys(devices) {
    return (keyA, keyB) => {
        const aConnected = devices[keyA].connected;
        const bConnected = devices[keyB].connected;

        if (!aConnected && bConnected) {
            return 1;
        }

        if (aConnected && !bConnected) {
            return -1;
        }

        return 0;
    };
}

function getSelectedAndConnectedDevices(selectedDevices, devices) {
    const selectedAndConnected = selectedDevices.filter(deviceKey => {
        if (!devices[deviceKey]) {
            throw new Error(`${deviceKey} is not a valid monitor`);
        }

        return devices[deviceKey].connected;
    });

    if (selectedDevices.length && !selectedAndConnected.length) {
        throw new Error('Non of the given monitors are connected, aborting...');
    }

    return selectedAndConnected;
}

function getXrandrOptions(
    deviceKeys,
    devices,
    positionParameter = '--right-of'
) {
    return deviceKeys.reduce((acc, deviceKey, currentIndex) => {
        const device = devices[deviceKey];

        const monitorOptions = [`--output ${deviceKey}`];

        monitorOptions.push('--auto');

        if (currentIndex > 0 && device.connected) {
            monitorOptions.push(
                `${positionParameter} ${deviceKeys[currentIndex - 1]}`
            );
        }

        return [acc, ...monitorOptions].join(' ');
    }, '');
}

async function generateXrandrOptions(
    selectedDevices = [],
    positionParameter = '--right-of'
) {
    const devices = await getDevices();

    const selectedAndConnected = getSelectedAndConnectedDevices(
        selectedDevices,
        devices
    );

    if (selectedDevices.length && !selectedAndConnected.length) {
        throw new Error('Non of the given monitors are connected, aborting...');
    }

    console.log(
        'Switching on',
        selectedAndConnected.length
            ? selectedAndConnected.join(', ')
            : 'all connected monitors'
    );

    const orderedDeviceKeys = [
        ...selectedAndConnected,
        ...Object.keys(devices)
            .filter(key => !selectedAndConnected.includes(key))
            .sort(sortDeviceKeys(devices))
    ];

    const xrandrOptions = getXrandrOptions(
        orderedDeviceKeys,
        devices,
        positionParameter
    );

    return xrandrOptions;
}

async function printDevices() {
    const devices = await getDevices();

    const connectedMonitors = Object.keys(devices).filter(
        key => devices[key].connected
    );
    const disconnectedMonitors = Object.keys(devices).filter(
        key => !devices[key].connected
    );

    console.log(`Connected Monitors: ${connectedMonitors.join(', ')}`);
    console.log(`Disconnected Monitors: ${disconnectedMonitors.join(', ')}`);
}

async function activate(selectedMonitors, postCmd) {
    const xrandrOptions = await generateXrandrOptions(selectedMonitors);

    await exec(`xrandr ${xrandrOptions}`);

    if (postCmd) {
        await exec(postCmd);
    }
}

module.exports.printDevices = printDevices;
module.exports.activate = activate;
