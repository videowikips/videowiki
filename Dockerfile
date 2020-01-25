FROM node:10.15.0-jessie

WORKDIR /home/videowiki
# COPY ./package.json .
# RUN npm install
COPY . .
# RUN npm run build

EXPOSE 4000
EXPOSE 4001
EXPOSE 4002
EXPOSE 4003
EXPOSE 4006
EXPOSE 4007
EXPOSE 4008
EXPOSE 4009

CMD ["npm", "run", "dev:server"]

