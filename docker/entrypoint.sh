#!/bin/bash
set -e

if [ $CONTAINER_TIMEZONE ] &&  [ "$SET_CONTAINER_TIMEZONE" = "false" ]; then
    echo ${CONTAINER_TIMEZONE} >/etc/timezone && dpkg-reconfigure -f noninteractive tzdata
    echo "Container timezone set to: $CONTAINER_TIMEZONE"
    export SET_CONTAINER_TIMEZONE=true
else
    echo "Container timezone not modified"
fi

if [ "$1" = 'app' ]; then
    rm /oneglances/one-glances/config.js
    cp /oneglances/one-glances/config.js.ini /oneglances/one-glances/config.js
    sed -i 's/3/'$API'/g' /oneglances/one-glances/config.js
    sed -i 's/61208/'$PORT'/g' /oneglances/one-glances/config.js
    sed -i 's/127.0.0.1/'$SERVER'/g' /oneglances/one-glances/config.js
    sed -i 's/http/'$HTTP'/g' /oneglances/one-glances/config.js
    nginx -g "daemon off;"
fi

exec "$@"