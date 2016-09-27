
# FROM mhart/alpine-node:latest

# RUN apk add openssl --update-cache
# FROM node:latest

RUN apt-get update && apt-get install -y curl zsh
WORKDIR /src
ADD . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

# If you need npm, don't use a base tag
RUN npm install


EXPOSE 8080
CMD npm run-script prod
