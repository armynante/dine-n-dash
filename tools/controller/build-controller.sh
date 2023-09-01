#!/bin/bash

# Variables
EC2_IP="ec2-52-202-82-154.compute-1.amazonaws.com"
CONTAINER_NAME="diner-controller"
IMAGE_NAME="846818564997.dkr.ecr.us-east-1.amazonaws.com/diner-controller"

# Connect to EC2
ssh "ec2-user@$EC2_IP" << EOF

  # Navigate to the repo
  cd $diner-c

  # Pull latest code from GitHub
  git pull origin master

  # Rebuild Docker container
  docker build -t $CONTAINER_NAME -f ./apps/controller/Dockerfile .

EOF
