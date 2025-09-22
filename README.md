# BPMN-Diff

> En cours de réalisation : le readme n'est pas complet

Ce projet contient deux applications :

* **Frontend** : application ViteJS (UI)
* **Backend** : application Spring Boot (API)

# Installation sur Openshift

### 1. Prérequis

* Docker (pour builder les images)
* Kubernetes cluster (minikube, k3s, GKE, AKS, EKS…)
* Helm 3+
* Etre connecté à Openshift en CLI.

### 2. Builder et pousser les images Docker

Les Dockerfile se trouvent dans :

* `./frontend/Dockerfile`
* `./backend/Dockerfile`

#### Backend

```bash
docker build -t <registry>/backend:latest ./backend
docker push <registry>/backend:latest
```

#### Frontend

```bash
docker build -t <registry>/frontend:latest ./frontend
docker push <registry>/frontend:latest
```

> Remplacez `<registry>` par votre propre registry (nexus, gitlab, ...).

---

### 3. Helm Chart - Déploiement Kubernetes

Le chart Helm est situé dans `./helm`.

#### 3.1. Configurer les images et registry

Éditez `values.yaml` présent dans le dossier `helm` pour indiquer vos images :

```yaml
image:
  frontend:
    repository: <registry>/frontend
    tag: latest
  backend:
    repository: <registry>/backend
    tag: latest

# Pour un registry privé
imagePullSecrets:
  - name: secret-innersource
```
#### 3.2. Configuration des secrets

Vous devez être au préalable connecté à OpenShift.

Si votre registry est privé, créez le secret docker-registry suivant :

```bash
kubectl create secret docker-registry secret-innersource \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email>
```

Il vous faudra égalament créer un secret pour renseigner le token GITLAB utilisé par l'application
```bash
kubectl create secret generic gitlab-secret \
  --from-literal=GITLAB_TOKEN=<your-token>
```
---

#### 3.3. Déployer le chart

```bash
# Installer
helm install bpmn-diff ./helm/ -f ./helm/values.yaml -n <NAMESPACE_BPMN_DIFF>

# Mettre à jour après modification
helm upgrade bpmn-diff ./helm/ -f ./helm/values.yaml -n <NAMESPACE_BPMN_DIFF>

# Supprimer le déploiement
helm uninstall bpmn-diff
```

---

#### 3.3. Vérifier les pods et services

```bash
kubectl get pods
kubectl get svc
```

Pour tester localement :

```bash
kubectl port-forward svc/frontend 8080:80
kubectl port-forward svc/backend 9000:9000
```