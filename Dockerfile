# Build frontend
FROM oven/bun AS builder-bun
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

ARG DOMAIN_NAME
ARG PLAUSIBLE_API_HOST
RUN echo "VITE_DOMAIN=${DOMAIN_NAME}\nVITE_PLAUSIBLE_API_HOST=${PLAUSIBLE_API_HOST}" > .env

RUN bun run build

# Build backend
FROM golang:1.23-alpine AS builder-go
WORKDIR /app

COPY --from=builder-bun /app/backend .
RUN go mod download
RUN go build -tags production -o citiesbeen


# Deploy binary
FROM alpine:latest AS runner
WORKDIR /app

RUN mkdir -p /app/pb_data


COPY --from=builder-go /app/citiesbeen .
RUN chmod +x /app/citiesbeen



EXPOSE 8090

CMD ["/app/citiesbeen", "serve", "--http=0.0.0.0:8090"]