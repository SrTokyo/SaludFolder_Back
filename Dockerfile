FROM node:8-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm rebuild bcrypt --build-from-source

EXPOSE 3000

CMD [ "node", "server.js" ]