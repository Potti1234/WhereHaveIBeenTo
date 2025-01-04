FROM golang:1.23-alpine AS builder-go
WORKDIR /app

COPY ./pocketbase .
RUN go mod download
RUN go build -tags production -o wherehaveibeento

# Deploy binary
FROM alpine:latest AS runner
WORKDIR /app

COPY --from=builder-go /app/wherehaveibeento .
RUN chmod +x /app/wherehaveibeento
# Create directory for pb_data
RUN mkdir -p /app/wherehaveibeento/pb_data

EXPOSE 8090

CMD ["/app/wherehaveibeento", "serve", "--http=0.0.0.0:8090"]
