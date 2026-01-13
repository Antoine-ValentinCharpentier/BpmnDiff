#!/bin/bash

NAMESPACE=bpmn-diff

docker build -t avcharpentier45/bpmn-diff-frontend:1.0 ./frontend/
docker push avcharpentier45/bpmn-diff-frontend:1.0

docker build -t avcharpentier45/bpmn-diff-backend:1.0 ./backend/
docker push avcharpentier45/bpmn-diff-backend:1.0

kind create cluster --config kind-config.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=Ready pod \
  -l app.kubernetes.io/component=controller \
  --timeout=300s

kubectl create namespace $NAMESPACE

helm upgrade --install bpmn-diff ./helm -f ./helm/values.yaml -n $NAMESPACE
