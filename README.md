# One Glances

IHM Theme "design material" for glances

![mobile](images/mobileview.png "Example of One glances view web")

You can find glances on https://nicolargo.github.io/glances/

## Installation

you can clone project an copy file in your root path nginx

    git clone https://github.com/fraoustin/one-glances.git
    cp -R * /<path_nginx_root>

You need load glances on computer

    glances -w

You can access on http://127.0.0.1

One Glances use library

- https://github.com/lugolabs/circles
- https://getmdl.io/
- http://www.chartjs.org/

## Use docker

you can use docker and docker-compose for generate one-glances

your docker-compose

    version: '2'
    services:
        proxy:
            images: fraoustin/one-glances
            ports:
                - "80:80"
            environment:
                - SET_CONTAINER_TIMEZONE=true
                - CONTAINER_TIMEZONE=Europe/Paris
                - SERVER=127.0.0.1
                - PORT=80
                - API=3
                - HTTP=http
            depends_on:
                - glances
            restart: always
        glances:
            images: nicolargo/glances
            pid: "host"
            volumes:
                - /var/run/docker.sock:/var/run/docker.sock:ro
            environment:
                - GLANCES_OPT=-w
            restart: always

## plugin glances

You can copy plugins/* in your glances directory glances/plugins/

You have to install speedtest-cli module 

    pip install speedtest-cli

You can add parameter in glances.conf

    [logfiles]
    path0=/log/backup.log
    split0=####################\n
    ln0=1
    path1=/log/syslog
    path2=/log/maj_cert.log
    split2=####################\n
    ln2=1
     
    [publicip]
    domain0=fraoustin.fr
    
    [notification]
    test0=stat['publicip'][0]['ip'] != stat['ip']['public_address']
    title0=Check ip fraoustin.fr
    email0-0=fraoustin@gmail.com;XXXXXXXX;smtp.gmail.com:587

