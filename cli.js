#!/usr/bin/env node
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const swm = require('./swm.js');
const config = require('./config.js');
const postCmd = argv.postCmd || config.postCmd;

if (argv.help || argv.h) {
    console.log(
`Simple helper for turning on/off connected/disconnected monitors with 'xrandr'.

Usage:

'swm [monitor-1...montior-n] [--postCmd="cmd"]' e.g. 'swm LVDS1 HDMI1'

If 'monitor-1' to 'monitor-n' is specified 'swm' will turn on these monitors
and place them from left to right in the order given. If a provided monitor is
not connected it will be skipped.

If no monitors are specified all connected monitors will be turned on and
placed from left to right in alphabetical order of their name.

If "--postCmd" is given, this command is executed after switching the monitors.
This is usefull to tell your window manager to re-detect monitors, e.g. for
herbstluftwm "herbstclient reload".

'swm -l' or 'swm --list'

List all devices with the connectivity status.

The configuration can be placed in "$XDG_CONFIG_HOME/switchmon/config.json" in
the form of

{
    "postCmd": "some command"
}`

    );

    process.exit(2);
}

if (argv.list || argv.l) {
    swm.getDevices()
        .then(devices => {
            console.log('Detected devices:\n');
            Object.keys(devices)
                .sort(key => !devices[key].connected)
                .forEach(key => console.log(key + ':', devices[key].connected ? 'Connected' : 'Disconnected'));
            process.exit(0);
        });
} else {
    swm.getDevices()
        .then(swm.generateXrandrOptions.bind(null, argv._))
        .then(swm.switchDevices)
        .then(swm.executePostCmd.bind(null, postCmd))
        .catch(err => {
            console.error(err);
        });
}
