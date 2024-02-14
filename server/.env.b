# SERVER
SERVER_HOSTNAME=serverb
SERVER_HTTP_PORT=3001
SERVER_HTTPS_PORT=3444
SERVER_MTLS_PORT=3445
# CLIENT
CLIENT_HOSTNAME=servera
CLIENT_HTTP_PORT=3000
CLIENT_HTTPS_PORT=3442
CLIENT_MTLS_PORT=3443
# CERTS
SERVER_CA=../ca/ca.crt
SERVER_CERT=./certs/serverb.crt
SERVER_CERT_SIGNED=./certs/serverb-signed.crt
SERVER_CERT_KEY=./certs/serverb.key