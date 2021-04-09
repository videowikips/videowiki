FROM node:10.15.0-jessie

WORKDIR /home/videowiki
COPY ./package.json .
RUN npm install
COPY . .
RUN npm run build

EXPOSE 4000
EXPOSE 4001
EXPOSE 4002
EXPOSE 4003

CMD ["npm", "start"]

