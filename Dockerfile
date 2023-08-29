FROM node:16-alpine as build
WORKDIR /server
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Production Image
FROM node:lts-alpine as production
ENV NODE_ENV=production
WORKDIR /server
COPY package.json .
RUN npm install --production --silent && mv node_modules ../
COPY --from=build /server/dist ./dist

EXPOSE 5000
RUN chown -R node /server

USER node
CMD ["node", "dist/index.js"]