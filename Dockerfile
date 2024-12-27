FROM golang:1.23.3-bullseye

WORKDIR /pocketbasego

COPY ./pocketbase .

RUN go mod init pocketbasego

RUN go get github.com/pocketbase/pocketbase@v0.22.23 

RUN go mod tidy

EXPOSE 8080

CMD [ "go", "run", "main.go", "serve", "--http=0.0.0.0:8090"] 
