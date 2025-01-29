# Build frontend
FROM node:20-alpine AS builder-node
WORKDIR /app

COPY . .
RUN cd frontend && npm ci

ARG DOMAIN_NAME
ARG PLAUSIBLE_API_HOST
RUN cd frontend && echo "VITE_DOMAIN=${DOMAIN_NAME}\nVITE_PLAUSIBLE_API_HOST=${PLAUSIBLE_API_HOST}" > .env

RUN cd frontend && npm run build


# Build backend
FROM golang:1.23-alpine AS builder-go
WORKDIR /app

COPY --from=builder-node /app/backend .
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