FROM node:21.7.3-alpine3.20

WORKDIR /client

COPY package*.json ./

RUN npm install

COPY public ./public

COPY src ./src

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]