# Quasar Project with Symfony Backend and Docker

This document provides instructions for setting up a Quasar frontend served by Apache and a Symfony backend exposing API endpoints, orchestrated with Docker Compose.

## Project Structure
```
projet/
├── api-backend/                # Symfony backend
│   ├── composer.json
│   ├── composer.lock
│   ├── public/
│   ├── src/
│   └── (other Symfony files)
├── quasar-project/            # Quasar frontend
│   ├── package.json
│   ├── src/
│   └── (other Quasar files)
├── docker/                    # Docker configuration files
│   ├── Dockerfile.frontend    # Dockerfile for Quasar frontend
│   ├── Dockerfile.symfony     # Dockerfile for Symfony backend
│   ├── apache.conf            # Apache configuration for Symfony
│   ├── .htaccess              # Apache configuration for Quasar SPA routing
│   ├── docker-compose.yml     # Docker Compose configuration
│   └── README.txt             # This file
├── .dockerignore             # Files excluded from Docker build
```

## Prerequisites
- Docker and Docker Compose installed.
- A Quasar project initialized in `quasar-project/` (`quasar create`).
- A Symfony project initialized and configured in `api-backend/` with API endpoints.
- PHP 8.2+ and Composer for backend development.

## Setup
1. **Clone the repository**:
   ```bash
   git clone <your-repo>
   cd <your-repo>
   ```

2. **Set up the Symfony backend**:

    already done

3. **Set up the frontend**:
   - Ensure the Quasar project is in `quasar-project/`.
   - Place `docker/Dockerfile.frontend`, `docker/.htaccess`, `docker/apache.conf`, `docker/docker-compose.yml`, and `docker/README.txt` in the `docker/` folder.
   - Add `.dockerignore` at the project root.

4. **Build and run containers**:
   ```bash
   cd docker
   docker-compose up -d
   ```

5. **Access the application**:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000/api`

## Configuration
- **Frontend**:
  - Built with `npm run build` (generates `quasar-project/dist/spa`).
  - Served by Apache on port 80 (mapped to 8080 on the host).
  - Uses `.htaccess` for SPA routing.
  - Make API calls to `http://backend:80/api` from Quasar (e.g., using Axios):
    ```javascript
    import axios from 'axios';
    axios.get('http://backend:80/api').then(response => {
      console.log(response.data);
    });
    ```

- **Backend**:
  - Symfony application with API endpoints, served by Apache on port 80 (mapped to 3000 on the host) in production.
  - Uses `apache.conf` to configure the document root to `/public`.
  - Environment variables (e.g., `APP_SECRET`) are set in `docker-compose.yml`.

- **Docker Compose**:
  - Orchestrates `frontend` and `backend` services.
  - The `frontend` service depends on `backend` to ensure correct startup order.

## Development
For development with hot-reload:
1. Modify `docker/Dockerfile.frontend`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY quasar-project/package*.json ./
   RUN npm install
   COPY quasar-project/ .
   EXPOSE 8080
   CMD ["npm", "run", "dev"]
   ```

2. Update `docker/docker-compose.yml` to add volumes:
   ```yaml
   frontend:
     build:
       context: ..
       dockerfile: docker/Dockerfile.frontend
     ports:
       - "8080:8080"
     volumes:
       - ../quasar-project:/app
       - /app/node_modules
     environment:
       - NODE_ENV=development
     container_name: quasar-frontend
     depends_on:
       - backend
   ```

3. For the backend, use the provided `Dockerfile.symfony` for development with PHP's built-in server:
   ```dockerfile
   FROM php:8.3.6-cli
   RUN apt-get update && apt-get install -y \
       git \
       unzip \
       libicu-dev \
       libpq-dev \
       libzip-dev \
       libxml2-dev \
       zip \
       curl \
       libonig-dev \
       libssl-dev \
       gnupg2 \
       software-properties-common \
       libfreetype6-dev \
       libjpeg-dev \
       libpng-dev \
       libmariadb-dev \
       && docker-php-ext-configure gd --with-freetype --with-jpeg \
       && docker-php-ext-install intl xml pdo pdo_pgsql pdo_mysql zip mbstring bcmath gd
   COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
   WORKDIR /app
   COPY api-backend/composer.json api-backend/composer.lock ./
   RUN composer install
   COPY api-backend/ .
   RUN chown -R www-data:www-data /app && chmod -R 775 /app
   EXPOSE 8000
   CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
   ```
   Update `docker-compose.yml` for development:
   ```yaml
   backend:
     build:
       context: ..
       dockerfile: docker/Dockerfile.symfony
     ports:
       - "3000:8000"
     container_name: quasar-backend
     environment:
       - APP_ENV=dev
       - APP_SECRET=your-secret-key-change-me
     volumes:
       - ../api-backend:/app
       - /app/vendor
   ```

## Stopping the Application
```bash
cd docker
docker-compose down
```

## Troubleshooting
- Check logs:
  ```bash
  docker logs quasar-frontend
  docker logs quasar-backend
  ```
- Ensure ports 8080 and 3000 (or 8000 for development) are free.
- Verify `mod_rewrite` is enabled for SPA routing and Symfony in production.
- Check Symfony's `.env` or `docker-compose.yml` for correct environment variables.

## Next Steps
- Add a database (e.g., MySQL or PostgreSQL) to `docker-compose.yml`.
- Configure HTTPS for Apache in production.
- Expand API endpoints in Symfony as needed.
- Integrate with a CI/CD pipeline for automated deployments.

For further assistance, contact the development team.