# SWM - Switch Monitors

Simple helper for turning on/off connected/disconnected monitors with `xrandr`.

## Usage

`swm [monitor-1...montior-n]` e.g. `swm LVDS1 HDMI1`

If `monitor-1` to `monitor-n` is specified `swm` will turn on these monitors
and place them from left to right in the order given. If a provided monitor is
not connected it will be skipped.

If no monitors are specified all connected monitors will be turned on and
placed from left to right in alphabetical order of their name.

## Requirements

Node.js > 4.x on your PATH.
