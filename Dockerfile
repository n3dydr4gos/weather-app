FROM nginx:alpine

COPY public /usr/share/nginx/html
COPY src/main.js /usr/share/nginx/html/src/main.js
COPY src/style.css /usr/share/nginx/html/src/style.css

EXPOSE 80
