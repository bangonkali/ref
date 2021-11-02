FROM node:14.17.5-alpine AS build

WORKDIR /opt/webapp

COPY package.json .
RUN yarn install && yarn add --dev eslint

COPY . .
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]