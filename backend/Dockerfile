FROM rust:1.76

# Install the distribution CA update for the eMudhra incident.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /usr/src/backend
COPY . .

RUN cargo install --path .

CMD ["./target/release/backend"]
