FROM node:14

# Creating a new directory for app files and setting path in the container
WORKDIR /var/app

USER root

# Copy instalation files from your file system to container file system
COPY package.json ./
COPY package-lock.json* ./

# Instal dependencies
RUN npm install -g @angular/cli@12.2.4
RUN npm install -g @ionic/cli@6.18.1
RUN npm install

# Copy all files to the container file system
# COPY ./ .

CMD ["npm", "run", "start-ionic"]

EXPOSE 80
