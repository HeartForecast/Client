# 1단계: 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY . .

ARG ENV_FILE=.env
COPY ${ENV_FILE} .env

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:18-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
