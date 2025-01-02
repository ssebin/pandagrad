#!/bin/bash
# Modify Nginx configuration to set the root to the 'public' directory
sed -i 's|root /home/site/wwwroot;|root /home/site/wwwroot/public;|g' /etc/nginx/sites-available/default

# Reload Nginx configuration
service nginx reload

# Start PHP-FPM (if not already running)
service php-fpm start || true

# Change ownership and permissions if necessary
chown -R www-data:www-data /home/site/wwwroot

# Start supervisord to manage Nginx and PHP-FPM
/usr/bin/supervisord -c /etc/supervisord.conf