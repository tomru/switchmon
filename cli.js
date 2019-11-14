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
    return;
} else if (argv.list || argv.l) {
    const devices = swm.getDevices((err, devices) => {
        if (err) {
            throw new Error(err);
        }
        console.log('Detected devices:\n');
        Object.keys(devices)
            .sort(key => !devices[key].connected)
            .forEach(key =>
                console.log(key + ':', connectionStatus(devices[key]))
            );
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

    console.log(
        'Switching on',
        selectedMonitors.length ? selectedMonitors : 'all connected monitors'
    );

    swm.getDevices((err, devices) => {
        if (err) {
            throw new Error(err);
        }
        const xrandrOptions = swm.generateXrandrOptions(
            selectedMonitors,
            devices
        );
        swm.switchDevices(xrandrOptions);
        swm.executePostCmd(postCmd);
    });
}
