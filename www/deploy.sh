#! /bin/bash
ssh saas@107.170.128.217 <<< $'cd /var/www/revisionwise/revisionwise_frontend && git pull'
