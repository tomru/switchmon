#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));

const swm = require('./swm.js');
const config = require('./config.js');
const usage = require('./usage.js');

const postCmd = argv.postCmd || config.postCmd;
const profile = argv.profile || argv.p;

if (argv.help || argv.h) {
    console.log(usage);
    return;
}

if (argv.list || argv.l) {
    swm.printDevices();
    return;
}

let selectedMonitors = argv._;

if (profile) {
    if (!config.profiles[profile]) {
        throw Error(`profile ${profile} not found in config`);
    }
    selectedMonitors = config.profiles[profile];
    console.log('Using profile', profile);
}

console.log('Uh, I like it!');
swm.activate(selectedMonitors, postCmd);
