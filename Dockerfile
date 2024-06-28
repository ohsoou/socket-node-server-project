# node 이미지 선택
FROM node:21.7.2-alpine

# 실행시 위치 지정
WORKDIR /usr/src/app

# 빌드된 결과물 복사
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 8085
CMD ["yarn", "start:local"]