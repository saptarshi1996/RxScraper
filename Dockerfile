FROM node:14.17.3

WORKDIR /app

COPY . ./

RUN npm install
