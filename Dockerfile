# 1. Start from a lightweight Node.js image
FROM node:20-alpine

# 2. Create a working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy all other project files
COPY . .

# 6. Make sure uploads folder exists
RUN mkdir -p uploads

# 7. Expose the app port
EXPOSE 3000

# 8. Start your app
CMD ["node", "server.js"]
