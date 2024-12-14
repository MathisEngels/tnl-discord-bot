FROM --platform=arm64 arm64v8/node:current-alpine3.20 as builder

ADD . /app
WORKDIR /app
RUN npm install

ENV NODE_ENV production
RUN npm run build

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune


FROM --platform=arm64 arm64v8/node:current-alpine3.20 as runner
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules app/node_modules

CMD ["node", "/app/dist/index.js"]