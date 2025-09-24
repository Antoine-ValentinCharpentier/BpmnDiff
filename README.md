# BPMN-Diff

# Contexte

Lors des merge requests, il n’est pas simple d'approuver ou refuser les modifications effectuées sur des BPMN. En effet,  :
- Les BPMN repose sur du XML, qui n’est pas facilement lisible pour un humain.
- Les modifications mineures (changement d’attribut, déplacement de noeud) peuvent être difficilement détecté si on aurait simplement ouvert le nouveau BPMN sur le modeler.
- Les merges entre branches peuvent introduire des conflits invisibles si l’on se contente de regarder le XML brut.

Pour simplifier la revue des BPMN et visualiser les changements, nous proposons cet outil, qui offre différentes représentations des modifications selon le contexte souhaité.

Modes de comparaison
- `Modifications sur une branche seule` : Visualise toutes les modifications apportées sur une branche spécifique, sans tenir compte des autres branches. Cela permet de suivre l’évolution d’une branche de manière indépendante et de reporterp lus facilement les modifications en cas de merge conflicts importants non résolvable automatiquement.
- `Modifications prévues après auto-merge` : Simule l’auto-merge Git pour montrer les modifications qui seraient appliquées sur une branche cible. Ce mode est utile pour anticiper les conflits et comprendre l’impact d’un merge avant de l’exécuter.
- `Comparaison brute entre deux branches` : Compare directement les BPMN entre deux branches, sans utiliser l’auto-merge. Cela permet de voir la différence exacte. Ce mode est utile si l'on souhaite remplacer un BPMN d'une branches par une autre en évaluant le risque des modifications apportées.

## Utilisation

### 1. Modifications sur une branche seule

Pour visualiser toutes les modifications effectuées sur une branche spécifique par rapport à sa branche de référence :

* **Accès IHM** : via le lien

```
/diff/{projectId}?branch=<nom_branche>&baseBranch=<branche_de_reference>
```

* **Paramètres** :
  * `projectId` : l'identifiant du projet git
  * `branch` : la branche que vous souhaitez analyser
  * `baseBranch` : le nom de la branche qui a initié la branche à analyser
* **Signification** : montre l’évolution complète d’une branche isolée, sans tenir compte d’autres branches.

---

### 2. Modifications prévues après auto-merge

Pour visualiser les changements qui seraient appliqués après un merge simulé :

* **Accès IHM** : via le lien

```
/diff/{projectId}?from=<branche_source>&to=<branche_cible>&mode=after-merge
```

* **Paramètres** :
  * `projectId` : l'identifiant du projet git
  * `from` : branche source (ancienne version)
  * `to` : branche cible (nouvelle version)
  * `mode=after-merge` : indique que l’on souhaite simuler l’auto-merge
* **Signification** : montre les modifications qui seraient apportées sur la branche source en cas de merge de la branche cible vers la source, utile pour anticiper conflits et changements inattendus.

---

### 3. Comparaison brute entre deux branches

Pour comparer directement deux branches sans auto-merge :

* **Accès IHM** : via le lien

```
/diff/{projectId}?from=<branche_source>&to=<branche_cible>&mode=exact
```

* **Paramètres** :
  * `projectId` : l'identifiant du projet git
  * `from` : branche source (ancienne version)
  * `to` : branche cible (nouvelle version)
  * `mode=exact` : indique un diff brut sans merge automatique
* **Signification** : permet de voir la différence exact entre deux branches, utile lorsque l'on souhaite remplacer un BPMN par un autre ou pour une comparaison directe. Possède le même comportement que l'outil de comparaison inclus dans le web modeler.

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