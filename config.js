'use strict';

const configPath = require('xdg').basedir.configPath('switchmon/config.json');

const defaults = {
    postCmd: undefined,
    profiles: {}
};

let config = Object.assign({}, defaults);

try {
    config = Object.assign(config, require(configPath));
} catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
    }
    // No config found in "${configPath}". Using defaults...
}

module.exports = config;
