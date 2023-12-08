#!/bin/bash

# Define the name of your Kubernetes secret and the namespace (if needed)
SECRET_NAME="prod-secrets"
NAMESPACE="default"  # Change as needed

# Specify the output file
OUTPUT_FILE="deployment/prod/common/secrets_file.yaml"  # Change this to your desired file name

# Start of the Secret YAML, redirecting output to the specified file
echo "apiVersion: v1" > "$OUTPUT_FILE"
echo "kind: Secret" >> "$OUTPUT_FILE"
echo "metadata:" >> "$OUTPUT_FILE"
echo "  name: $SECRET_NAME" >> "$OUTPUT_FILE"
echo "  namespace: $NAMESPACE" >> "$OUTPUT_FILE"
echo "type: Opaque" >> "$OUTPUT_FILE"
echo "data:" >> "$OUTPUT_FILE"

# Read each line in the .env file and add it to the secret
while read -r line; do
  if [[ ! -z "$line" ]]; then
    KEY=$(echo $line | cut -f1 -d'=')
    VALUE=$(echo $line | cut -f2- -d'=' | base64)
    echo "  $KEY: $VALUE" >> "$OUTPUT_FILE"
  fi
done < .env

kubectl config use-context do-nyc3-dine-n-dash-cluster

kubectl apply -f deployment/prod/common/secrets_file.yaml
