# syntax=docker/dockerfile:1.7

# -----------------------------------------------------------------------------
# Build stage
# -----------------------------------------------------------------------------
FROM golang:1.23-alpine AS builder

# Install build dependencies (git for go modules pulling private repos if needed,
# ca-certificates for HTTPS go-get).
RUN apk add --no-cache git ca-certificates

WORKDIR /src

# Cache module downloads in a separate layer.
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source and build.
COPY . .

# Build a static binary:
# - CGO_OFF: no glibc dependency, fully static
# - -ldflags="-s -w": strip debug symbols, smaller binary
# - -trimpath: strip absolute paths from the binary (reproducible builds)
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
        -trimpath \
        -ldflags="-s -w" \
        -o /out/api \
        ./cmd/api

# -----------------------------------------------------------------------------
# Runtime stage
# -----------------------------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot

# Distroless gives us:
# - No shell, no package manager (smaller attack surface)
# - Non-root user by default
# - CA certificates included
# - About 2 MB base image

WORKDIR /app

COPY --from=builder /out/api /app/api

# The API listens on :8080 inside the container.
# Caddy on the host (or in the compose network) routes traffic to it.
EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/app/api"]
