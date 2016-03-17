[![Build Status](https://travis-ci.org/tomru/switchmon.svg?branch=master)](https://travis-ci.org/tomru/switchmon) [![Coverage Status](https://coveralls.io/repos/github/tomru/switchmon/badge.svg?branch=master)](https://coveralls.io/github/tomru/switchmon?branch=master)

# SWM - Switch Monitors

Simple helper for turning on/off connected/disconnected monitors with `xrandr`.

## Synopsis
`swm`

`swm [monitor-1..montior-n]`

`swm --profile external`

`swm --list`

## Description

To turn on/off connected/disconnected monitors.

If no monitors are specified all connected monitors will be turned on and
placed from left to right in alphabetical order of their name.

If monitors `monitor-1..monitor-n` are specified these monitors will be turned
on and place them from left to right in the order given.

* `--profile profilename` or `-p profilename`

  If a profile is specified, the configured monitors will be turned on.

* `--postCmd "some cmd"`

  A post command is executed after switching the monitors.  This is usefull to
  tell your window manager to re-detect monitors, e.g. for herbstluftwm
  `herbstclient reload`.

* `-l` or `swm --list`

  List all devices with the connectivity status.

## Configuration

The configuration can be placed in `$XDG_CONFIG_HOME/switchmon/config.json` in
the form of

```
{
    "postCmd": "some command",
    "profiles": {
        "internal": ["LVDS1"],
        "external": ["HDMI1"],
        "dual": ["LVDS1", "HDMI1"]
    }
}
```

## Requirements

Node.js > v4 on your PATH.
