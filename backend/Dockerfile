# Builds the API into a single static binary, then ships it on a bare image.
# Works as-is on Railway, Render and Fly.io — all three detect a Dockerfile.
FROM golang:1.27-alpine AS build
WORKDIR /src

# Copy the manifests first so dependency downloads stay cached across edits
# that only touch source files.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# CGO off keeps the binary static, which is what lets the final stage be empty.
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
# The pooler connection is TLS, so the image needs root certificates; the
# distroless static image already carries them.
COPY --from=build /out/api /app/api

# The host injects PORT. config.go falls back to 8080 when it is absent, and
# the server binds every interface, which a container requires.
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/api"]
