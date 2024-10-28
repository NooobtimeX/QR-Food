# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock files, then install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files
COPY . .

# Set environment variable for Prisma to generate the correct binary
ENV PRISMA_BINARY_TARGETS="native linux-musl-openssl-3.0.x"

# Generate the Prisma client with correct binaries
RUN npx prisma generate

# Build the Nuxt.js application
RUN npm run build

# Expose the port Nuxt.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
