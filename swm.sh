#!/usr/bin/env bash
#
# Enable all connected montiors, disable all disconnected ones.
# Multiple monitors will be added to the right of previous ones.
#
# Author Thomas Ruoff <Thomas.Ruoff@gmail.com>

set -e

CONNECTED=$( xrandr | grep " connected" | awk '{print $1}')
DISCONNECTED=$( xrandr | grep "disconnected" | awk '{print $1}')

POSTCMD="herbstclient reload"


# turn off all disconnected monitors
XRANDR_OFF_OPTIONS=""
for mon in $DISCONNECTED; do
    XRANDR_OFF_OPTIONS+=" --output $mon --off"
done

# turn on all connected monitors
XRANDR_ON_OPTIONS=""
LAST=""
for mon in $CONNECTED; do
    XRANDR_ON_OPTIONS+=" --output $mon --auto"
    if [ ! -z $LAST ]; then
        XRANDR_ON_OPTIONS+=" --right-of $LAST"
    fi
    LAST=$mon
done

xrandr $XRANDR_ON_OPTIONS $XRANDR_OFF_OPTIONS &&\
    echo Activated monitors: ${CONNECTED} &&\
    $POSTCMD

exit $?
