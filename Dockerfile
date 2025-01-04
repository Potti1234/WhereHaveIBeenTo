FROM golang:1.23-alpine AS builder-go
WORKDIR /app

COPY ./pocketbase .
RUN go mod download
RUN go build -tags production -o wherehaveibeento

# Deploy binary
FROM alpine:latest AS runner
WORKDIR /app

RUN mkdir -p /app/pb_data

COPY --from=builder-go /app/wherehaveibeento .
RUN chmod +x /app/wherehaveibeento

EXPOSE 8090

CMD ["/app/wherehaveibeento", "serve", "--http=0.0.0.0:8090"]
