# Use official Node.js runtime as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy backend source code into the container
COPY . .

# Expose the Express server port
EXPOSE 3000

# Start the Node backend application
CMD ["node", "controller.js"]