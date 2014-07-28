# SWM - Switch Monitors

Simple helper for turning on/off connected/disconnected monitors with `xrandr`.

It uses `xrandr` to detect on which connectors there are monitors connected. It
then runs `xrandr` and sets all disconnected monitors to `off` and all connected
monitors to `on`.

Monitors will be turned on with xrandr `--auto` option which tries to detect
the optimal video setting.

If there are multiple monitors connected, each monitor is placed to the right
of the previous monitor. This order is currently driven as xrandr lists the
connectors.
