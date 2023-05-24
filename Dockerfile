FROM node:gallium-alpine

# this package has dependencies (iconv) that require build tools
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add python3 make g++

WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# # Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
COPY src src
RUN yarn install --production
RUN apk del build-dependencies

EXPOSE 3040

ADD start-prod.sh /usr/src/app
RUN chmod +x ./start-prod.sh
CMD ["./start-prod.sh"]
