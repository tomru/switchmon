#!/usr/bin/env node
'use strict';

const argv = require('minimist')(process.argv.slice(2));

const swm = require('./swm.js');
const config = require('./config.js');
const usage = require('./usage.js');

const postCmd = argv.postCmd || config.postCmd;
const profile = argv.profile || argv.p;

function connectionStatus(device) {
    return device.connected ? 'Connected' : 'Disconnected';
}

if (argv.help || argv.h) {
    console.log(usage);
    process.exit(0);
}

const devices = swm.getDevices();

if (argv.list || argv.l) {
    devices
        .then(devices => {
            console.log('Detected devices:\n');
            Object.keys(devices)
                .sort(key => !devices[key].connected)
                .forEach(key => console.log(key + ':', connectionStatus(devices[key])));
            process.exit(0);
        });
} else {
    let selectedMonitors = argv._;

    if (profile) {
        if (!config.profiles[profile]) {
            console.error('profile', profile, 'not found in config');
            process.exit(1);
        }
        selectedMonitors = config.profiles[profile];
        console.log('Using profile', profile);
    }

    console.log('Switching on', selectedMonitors);

    devices
        .then(swm.generateXrandrOptions.bind(null, selectedMonitors))
        .then(swm.switchDevices)
        .then(swm.executePostCmd.bind(null, postCmd))
        .catch(err => {
            console.error(err);
            process.exit(2);
        });
}
