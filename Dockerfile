FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    unzip curl libpq-dev libzip-dev libpng-dev libxml2-dev libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql zip gd xml mbstring bcmath \
    && apt-get clean

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-scripts && \
    composer dump-autoload --optimize --no-scripts

EXPOSE 8000

CMD php artisan package:discover --ansi && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
    # php artisan storage:link
