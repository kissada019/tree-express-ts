echo "Hello Jenkins"

rm -rf tree-express-ts
git clone https://github.com/kissada019/tree-express-ts.git

cd tree-express-ts

echo "build image and starting container"

docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build