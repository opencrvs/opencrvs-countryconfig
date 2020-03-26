FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn
ENV CHECK_INVALID_TOKEN true

WORKDIR /usr/src/app/src/zmb/chatbot
COPY src/zmb/chatbot/package.json package.json
COPY src/zmb/chatbot/yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY src/zmb/chatbot /usr/src/app/src/zmb/chatbot
RUN yarn build

EXPOSE 8060

# TODO wait for openhim api
CMD yarn start:prod
