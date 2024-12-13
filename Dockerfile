FROM --platform=arm64 arm64v8/node:current-alpine3.20 as builder

ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build

ENV NODE_ENV=production
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune


FROM --platform=arm64 arm64v8/node:current-alpine3.20 as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "./dist/index.js"]