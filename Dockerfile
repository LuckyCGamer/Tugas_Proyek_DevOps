FROM node:20-alpine
RUN apk add --no-cache nginx && mkdir -p /run/nginx
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN mkdir -p /usr/share/nginx/html \
 && cp -r public/. /usr/share/nginx/html/ \
 && cp frontend/nginx.conf /etc/nginx/http.d/default.conf
EXPOSE 3000 80
CMD ["node", "server/server.js"]