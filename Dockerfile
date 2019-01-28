FROM node:10.15.0-jessie

WORKDIR /home/videowiki
COPY ./package.json .
RUN npm install
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]

