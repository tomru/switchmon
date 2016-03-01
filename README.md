# SWM - Switch Monitors

Simple helper for turning on/off connected/disconnected monitors with `xrandr`.

## Usage
`swm [monitor-1...montior-n] [--postCmd="cmd"]` e.g. `swm LVDS1 HDMI1`

If `monitor-1` to `monitor-n` is specified `swm` will turn on these monitors
and place them from left to right in the order given. If a provided monitor is
not connected it will be skipped.

If no monitors are specified all connected monitors will be turned on and
placed from left to right in alphabetical order of their name.

If `--postCmd` is given, this command is executed after switching the monitors.
This is usefull to tell your window manager to re-detect monitors, e.g. for
herbstluftwm `herbstclient reload`.

`swm -l` or `swm --list`

List all devices with the connectivity status.

The configuration can be placed in `$XDG_CONFIG_HOME/switchmon/config.json` in
the form of

```
{
    "postCmd": "some command"
}
```

## Requirements

Node.js > 4.x on your PATH.
