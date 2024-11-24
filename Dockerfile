# Use the official Node.js 18 image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install nodemon
RUN npm install -g nodemon

# Copy the application source code
COPY . .

# Expose the port the app runs on (e.g., 3000)
EXPOSE 3000

# Set the command to start the app with nodemon
CMD ["nodemon", "./src/infra/api/server.ts"]
