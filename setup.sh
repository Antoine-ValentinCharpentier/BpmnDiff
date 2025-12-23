#!/bin/bash

NAMESPACE=bpmn-diff

kind create cluster --config kind-config.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=Ready pod \
  -l app.kubernetes.io/component=controller \
  --timeout=300s

kubectl create namespace $NAMESPACE

helm upgrade --install bpmn-diff ./helm -f ./helm/values.yaml -n $NAMESPACE
