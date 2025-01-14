#!/bin/bash

# Log file
LOGFILE=/home/LogFiles/startup.log

# Copy the custom Apache configuration
cp /home/site/wwwroot/apache.conf /etc/apache2/sites-available/000-default.conf 2>&1 | tee -a $LOGFILE

# Ensure the public directory has correct permissions
chmod -R 755 /home/site/wwwroot/public 2>&1 | tee -a $LOGFILE

# Restart Apache to apply the new configuration
service apache2 restart 2>&1 | tee -a $LOGFILE

# Start Apache in the foreground
apachectl -D FOREGROUND 2>&1 | tee -a $LOGFILE