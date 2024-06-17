FROM node:20
# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Inform Docker that the container is listening on the specified port.
EXPOSE 3000

# Run the web service on container startup.
CMD ["npm", "start"]
