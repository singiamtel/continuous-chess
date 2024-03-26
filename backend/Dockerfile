FROM rust:1.76

WORKDIR /usr/src/backend
COPY . .

RUN cargo install --path .

CMD ["./target/release/backend"]
