FROM --platform=arm64 arm64v8/node:current-alpine3.20 as builder

ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build

ENV NODE_ENV=production
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune


FROM --platform=arm64 arm64v8/node:current-alpine3.20 as runner
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules app/node_modules
COPY --from=builder /app/assets /assets

CMD ["node", "/app/dist/index.js"]