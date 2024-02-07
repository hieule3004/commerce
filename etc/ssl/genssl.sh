#!/usr/bin/env bash
# shellcheck disable=SC2164

TLD="local"
O="Commercial"
C="SG"
pass="secret"
ca_dir="secrets"
name="tls"
services="server client"

mkdir -p "${ca_dir}" && cd "${ca_dir}"
# create private ca
openssl req -new -x509 -keyout "ca-${TLD}.key" -out "ca-${TLD}.crt" -subj "/CN=ca-${TLD}/O=${O}/C=${C}" -days 9999 -passin pass:"${pass}" -passout pass:"${pass}"
cd "${OLDPWD}"

for s in ${services}; do
  # setup in dir
  mkdir -p "${s}" && cd "${s}"
  # create keystore
  keytool -noprompt -keystore "${name}.${s}.keystore.jks" -alias "${s}" -genkey -keyalg RSA -dname "CN=${s}-${TLD}, O=${O}, C=${C}" -storepass "${pass}" -keypass "${pass}"
  # create certificate signing request
  keytool -keystore "${name}.${s}.keystore.jks" -alias "${s}" -certreq -file "${s}.csr" -storepass "${pass}" -keypass "${pass}"
  # sign the key
  openssl x509 -req -CA "../${ca_dir}/ca-${TLD}.crt" -CAkey "../${ca_dir}/ca-${TLD}.key" -in "${s}.csr" -out "${s}-signed.crt" -days 9999 -CAcreateserial -passin pass:"${pass}"
  # import ca cert to keystore
  keytool -noprompt -keystore "${name}.${s}.keystore.jks" -alias CARoot -import -file "../${ca_dir}/ca-${TLD}.crt" -storepass "${pass}" -keypass "${pass}"
  # import signed cert to keystore
  keytool -noprompt -keystore "${name}.${s}.keystore.jks" -alias "${s}" -import -file "${s}-signed.crt" -storepass "${pass}" -keypass ${pass}
  # create truststore and import ca cert
  keytool -noprompt -keystore "${name}.${s}.truststore.jks" -alias CARoot -import -file "../${ca_dir}/ca-${TLD}.crt" -storepass "${pass}" -keypass "${pass}"
  # delete intermediate files
  rm "../${ca_dir}/ca-${TLD}.srl" "${s}-signed.crt" "${s}.csr" 2>/dev/null
  # exit dir
  cd "${OLDPWD}"
done
