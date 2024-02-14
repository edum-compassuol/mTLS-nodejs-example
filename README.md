# MTLS

## Roteiro Apresentação

1. O que é mTLS?
2. O que é TLS?
3. Para que serve TLS?
4. Figura http vs https
5. Como funciona o mTLS?
6. Figura funcionamento mTLS
7. Hands on

## Roteiro Hands on

1. Comunicação ServerA e ServerB com http
2. Criação dos certificado
3. Comunicação ServerA e ServerB https
4. Criação CA e assinatura dos certificados na CA
5. Comunicação ServerA e ServerB https mtls

## Criação dos certificados

### Criação do certificado para o servidor

1. Criando a chave
```sh
openssl genrsa -out server.key 2048
```
2. Criando o certificado
```sh
openssl req \
  -new \
  -key server.key \
  -subj '/CN=localhost' \
  -out server.csr
```
```sh
openssl x509 \
  -req \
  -in server.csr \
  -days 365 \
  -signkey server.key \
  -out server.crt
```
3. Inspecionando o certificado
```sh
openssl x509 --in server.crt -text --noout
```

### Criação do certificado da CA (root)

1. Criando o certificado root
```sh
openssl req \
  -new \
  -x509 \
  -nodes \
  -days 365 \
  -subj '/CN=root-ca' \
  -keyout ca.key \
  -out ca.crt
```
2. Inspecionando o certificado root
```sh
openssl x509 --in ca.crt -text --noout
```
3. Criando o certificado do servidor assinado com a CA
```sh
openssl x509 \
  -req \
  -in server.csr \
  -CA ca.crt \
  -CAkey ca.key \
  -CAcreateserial \
  -days 365 \
  -out server-signed.crt
```
4. Inspecionando o certificado assinado
```sh
openssl x509 --in server-signed.crt -text --noout
```