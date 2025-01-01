#!/bin/bash

# Start PHP-FPM
php-fpm -D

# Start Nginx with custom configuration
nginx -c /home/site/wwwroot/nginx.conf