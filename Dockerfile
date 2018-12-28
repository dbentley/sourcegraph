FROM golang:1.11.3-alpine

RUN apk add --no-cache --virtual .build-deps gcc musl-dev git mercurial musl-dev

COPY . /go/src/github.com/sourcegraph/sourcegraph

WORKDIR /go/src/github.com/sourcegraph/sourcegraph

ENV GO111MODULE on
ENV GOMOD_ROOT /go/src/github.com/sourcegraph/sourcegraph

RUN go install ./cmd/...