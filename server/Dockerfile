FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY server/package.json .
RUN npm install --production

COPY server/index.js .
COPY public /public

EXPOSE 3210
CMD ["node", "index.js"]
