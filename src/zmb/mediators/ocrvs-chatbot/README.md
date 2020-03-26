## Chatbot mediator

This package is a demonstrateion of how to develop an example API integration into OpenCRVS.
The mediator is used by the Telegram application chatbot to search OpenCRVS to find the age of a person.

It is a common use case for OpenCRVS that before a marriage takes place, a registrar should check the ages of the couple to make sure that they can legally get married.
The registrar may not have many details to hand about the couple, apart from names and perhaps place of birth.
The intention is that this chatbot could be ported to a 2-way SMS or USSD or WhatsApp application for greater coverage.

## What is Telegram, and what is a chatbot?

[Telegram](https://telegram.org/) is an OpenSource messaging app, like WhatsApp. A chatbot is an automated responder.
You can read about these technologies here: [Telegram](https://telegram.org/) application & [Telegram bot](https://core.telegram.org/bots)

## Production deployment

To deploy to production the following docker secrets will need to be available on the swarm (this is also covered in the server setup docs):

```sh
# For API access to the OpenHIM
printf "<openhim-user>" | docker secret create openhim-user -
printf "<openhim-password>" | docker secret create openhim-password -
```

In addition an API user will need to be created. This is a user with the CHATBOT_API_USER role and API_USER type. This can be done through the user management page in the app. The details of this API user must be shared with the integration partner to use to authenticate with OpenCRVS.

## Dev guide

Start the service with `yarn start`

Watch the tests with `yarn test:watch`

When in dev mode swagger API docs are available at `http://localhost:8040/documentation`

## After updating

Build container with `yarn docker:build`

Push image to Dockerhub `yarn docker:push`

SSH into manager node and scale service down then pull image before scaling back up `docker pull opencrvs/ocrvs-chatbot-mediator`
