FROM node:18-alpine

ARG NODE_ENV

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# Copy the .env file
COPY .env.bak .env


RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --production; \
    else \
      npm install; \
    fi


COPY . .
COPY entrypoint.sh /usr/local/bin/
# RUN ls -la /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV TZ=Asia/Dhaka

# CMD ["/usr/local/bin/entrypoint.sh"]
EXPOSE 3000
CMD ["npm", "run", "start:dev"]











