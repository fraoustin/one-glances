FROM nginx:1.13
MAINTAINER Aoustin Frederic


ENV SET_CONTAINER_TIMEZONE false 
ENV CONTAINER_TIMEZONE "" 

RUN apt-get update && apt-get install -y \
        apache2-utils \
        git \
&& rm -rf /var/lib/apt/lists/* 

COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir /oneglances
WORKDIR /oneglances
RUN git clone https://github.com/fraoustin/one-glances.git
RUN cp /oneglances/one-glances/config.js /oneglances/one-glances/config.js.ini

# manage default value
ENV SERVER 127.0.0.1
ENV PORT 80
ENV API 3

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["app"]
