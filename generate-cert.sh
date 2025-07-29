#!/bin/bash

# Create certificates directory
mkdir -p certs

# Generate self-signed certificate for development
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=EcoDEX/OU=Development/CN=localhost"

# Also create certificate for network IP
openssl req -x509 -newkey rsa:4096 -keyout certs/network-key.pem -out certs/network-cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=EcoDEX/OU=Development/CN=192.168.29.61"

echo "SSL certificates generated successfully!"
echo "You can now run the app with HTTPS using:"
echo "npm run start:https"