
# tail controller logs
ssh -i ./.ssh/controller.pem ubuntu@ec2-23-20-128-165.compute-1.amazonaws.com
docker logs fb5b0e0b5228 -f

docker context create diner-controller --docker "host=ssh://ubuntu@ec2-23-20-128-165.compute-1.amazonaws.com"
docker context use diner-controller
docker logs -f fb5b0e0b5228
docker context use default


docker run -d --name diner -p 80:8080 --env-file ./prod.env diner-controller

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-std
in 846818564997.dkr.ecr.us-east-1.amazonaws.com/diner-controller

docker build -t diner-controller -f ./apps/controller/Dockerfile .

--env-file