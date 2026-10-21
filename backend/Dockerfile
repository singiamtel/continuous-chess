FROM rust:1.76

# Reject the roots behind the compromised eMudhra intermediate CAs.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && sed -i -e 's|^mozilla/emSign_ECC_Root_CA_-_G3.crt|!&|' \
              -e 's|^mozilla/Comodo_AAA_Services_root.crt|!&|' /etc/ca-certificates.conf \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /usr/src/backend
COPY . .

RUN cargo install --path .

CMD ["./target/release/backend"]
