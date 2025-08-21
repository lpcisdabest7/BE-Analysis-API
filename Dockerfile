FROM node:20.18.3-slim As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt update

# Install dependencies
RUN apt install -y build-essential libssl-dev unzip wget zlib1g-dev git g++ apt-transport-https gnupg curl autoconf python3 libtool pkg-config

RUN yarn install


COPY . .

RUN npm run build

# PRODUCTION
# Base image for production
FROM node:20.18.3-slim As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --only=production --ignore-scripts
COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/src/main" ]
