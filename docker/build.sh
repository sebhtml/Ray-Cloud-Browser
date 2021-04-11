docker build -t ray-covid-sequences -f Dockerfile.sequences .
docker build -t docker-ray -f Dockerfile.ray.source .
docker build -t ray-cloud-browser -f Dockerfile.build .
docker build -t ray-cloud-browser-service -f Dockerfile.service .

docker run -d -p 127.0.0.1:8700:8080 ray-cloud-browser-service
