# Fetching the minified node image on apline linux
FROM node:slim

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /MCO

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

ENV NODE_ENV=production

# Starting our application
CMD [ "npm", "start" ]

# Exposing server port
EXPOSE 5000