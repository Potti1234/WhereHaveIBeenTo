FROM golang:1.19.2-bullseye

WORKDIR /pocketbasego

COPY ./pocketbase .

RUN go get github.com/pocketbase/pocketbase@v0.22.23 

RUN go mod tidy

EXPOSE 8090

CMD [ "go", "run", "main.go", "serve" ] 
