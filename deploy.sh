echo "Hello Jenkins"
rm -rf tree-express-ts
git clone https://github.com/kissada019/tree-express-ts.git
echo "successfully clone tree-express-ts"
echo "build image and starting container"
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d