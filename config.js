'use strict';

const configPath = require('xdg').basedir.configPath('switchmon/config.json');

const defaults = {
    postCmd: undefined,
};

let config = Object.assign({}, defaults);

try {
    config = Object.assign(config, require(configPath));
} catch(err) {
    // No config found in "${configPath}". Using defaults...
}

module.exports = config;