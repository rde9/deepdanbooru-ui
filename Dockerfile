# build front-end
FROM node:lts-alpine AS builder

COPY ./ /app
WORKDIR /app

RUN yarn install && yarn run build

# setup environment
FROM python:3.9-slim

RUN apt-get update && apt-get install -y git wget curl unzip
RUN git clone https://github.com/KichangKim/DeepDanbooru.git

WORKDIR /DeepDanbooru
RUN pip3 install --upgrade pip && \
    pip3 install -r requirements.txt && \
    pip3 install .
RUN wget https://github.com/KichangKim/DeepDanbooru/releases/download/v3-20211112-sgd-e28/deepdanbooru-v3-20211112-sgd-e28.zip && \
    unzip deepdanbooru-v3-20211112-sgd-e28.zip -d /pretrained && \
    rm deepdanbooru-v3-20211112-sgd-e28.zip

# run server
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

RUN npm install yarn -g

COPY /server /app
COPY --from=builder /app/build /app/public

WORKDIR /app
RUN yarn install

EXPOSE 7500

CMD ["yarn", "start"]