# BPMN-Diff

<img width="1895" height="851" alt="image" src="https://github.com/user-attachments/assets/9b3d9b86-592d-4bc8-874d-911d472ed1ec" />


## Contexte

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

Bien sûr ! Voici une section **Intégration** que tu peux ajouter au README pour expliquer comment exploiter l’outil dans les **merge requests** en utilisant les variables prédéfinies :

---

## Intégration dans les Merge Requests

L’outil peut être intégré directement dans vos templates de **Merge Request** pour fournir automatiquement les liens vers cet outil. Cela permet aux reviewers de consulter facilement les différences sans rechercher manuellement les branches ou les commits.

### Fonctionnement

* Les templates de MR peuvent contenir des **liens dynamiques** vers l’outil de comparaison.
* Les variables prédéfinies de GitLab (ou d’autres systèmes CI/CD) peuvent remplir automatiquement les champs nécessaires :

  * `${CI_MERGE_REQUEST_SOURCE_BRANCH}` → branche source (`from` ou `branch`)
  * `${CI_MERGE_REQUEST_TARGET_BRANCH}` → branche cible (`to` ou `baseBranch`)
  * `${CI_PROJECT_ID}` → ID du projet (`projectId`)

### Exemple d’intégration dans un template de MR

```markdown
### Comparaison BPMN

- [Diff BPMN sur la branche seule](https://votre-ihm/projets/${CI_PROJECT_ID}?branch=${CI_MERGE_REQUEST_SOURCE_BRANCH}&baseBranch=${CI_MERGE_REQUEST_TARGET_BRANCH})

- [Diff BPMN après auto-merge](https://votre-ihm/projets/${CI_PROJECT_ID}?from=${CI_MERGE_REQUEST_TARGET_BRANCH}&to=${CI_MERGE_REQUEST_SOURCE_BRANCH}&mode=after-merge)

- [Diff BPMN brut entre branches](https://votre-ihm/projets/${CI_PROJECT_ID}?from=${CI_MERGE_REQUEST_TARGET_BRANCH}&to=${CI_MERGE_REQUEST_SOURCE_BRANCH}&mode=exact)
```

# Installation via Docker Compose

## 1. Prérequis

* Avoir `Docker` et `Docker Compose` installés sur votre poste

## 2. Configuration

1. Dupliquer le fichier `.env.example`
2. Le renommer en `.env`
3. Renseigner un `token d’accès GitLab` dans la variable d’environnement suivante :

```env
GITLAB_TOKEN=xxxxxxxxxxxx
```
3. Si vous le souhaitez, vous pouvez également modifier les informations de connexion à Keycloak en changeant, dans le fichier `.env`, les variables `KEYCLOAK_USERNAME` et `KEYCLOAK_PASSWORD`.

4. Si vous le souhaitez, vous pouvez également modifier les informations de connexion à la base PostgreSQL de Keycloak en changeant, dans le fichier `.env`, les variables `POSTGRES_USERNAME` et `POSTGRES_PASSWORD`.

## 3. Installation

Lancer la commande suivante à la racine du projet :

```bash
docker compose up --build
```

## 4. Attendre

Attendre que tous les containers docker sont démarré.

## 4. Ajout d’un utilisateur

1. Accéder à l’interface Keycloak : [http://localhost:18000](http://localhost:18000)

2. S’authentifier avec les identifiants administrateur :

   * Username : Variable `KEYCLOAK_USERNAME` du fichier `.env`
   * Password : Variable `KEYCLOAK_PASSWORD` du fichier `.env`

3. Sélectionner le realm `bpmn-diff`

4. Aller dans :  Users → Create user

5. Renseigner les informations de l’utilisateur ainsi que ses credentials

Cette utilisateur pourra être utilisé pour se connecter aux IHM de BPMN Diff.

## 4. Tester l'installation

Accédez à localhost:3000 : vous serez redirigé vers Keycloak, puis, une fois connecté, vers une page Not Found, car vous n’avez pas renseigné les paramètres de l’analyse (numéro du projet GitLab, mode de comparaison et branches).
Voir la section Utilisation.

# Installation via Helm (Kubernetes)

Le déploiement s’appuie sur **Helm** et un fichier de configuration `values.yaml` présent dans le dossier helm.

Ce projet fournit un Helm, incluant :
- PostgreSQL
- Keycloak (authentification) et son realm
- Backend/Frontend BPMN Diff
- Routes / Ingress 
- Secrets 

## Configuration

Avant de déployer, il est recommandé de vérifier et adapter les valeurs de configuration en fonction de votre environnement (notamment les mots de passe, tokens, ...).

PostgreSQL
| Propriété             | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `postgresql.image`    | Image Docker utilisée pour PostgreSQL (version 17).        |
| `postgresql.database` | Nom de la base de données créée au démarrage du conteneur. |
| `postgresql.user`     | Utilisateur PostgreSQL disposant des droits sur la base.   |
| `postgresql.password` | Mot de passe associé à l’utilisateur PostgreSQL.           |

Keycloak
| Propriété                 | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `keycloak.image`          | Image Docker de Keycloak utilisée par le chart (version 26.1.0). |
| `keycloak.admin.username` | Nom d’utilisateur du compte administrateur Keycloak.             |
| `keycloak.admin.password` | Mot de passe du compte administrateur Keycloak.                  |
| `keycloak.realm`          | Nom du realm Keycloak créé ou utilisé par l’application.         |


Frontend
| Propriété                 | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| `frontend.image`          | Image Docker du frontend React BPMN Diff.                           |
| `frontend.clientId`       | Client ID Keycloak utilisé par le frontend pour l’authentification. |
| `frontend.user.username`  | Nom d’utilisateur du compte de démonstration frontend.              |
| `frontend.user.firstName` | Prénom du compte de démonstration.                                  |
| `frontend.user.lastName`  | Nom du compte de démonstration.                                     |
| `frontend.user.password`  | Mot de passe du compte de démonstration.                            |
| `frontend.user.email`     | Adresse email du compte de démonstration.                           |

Backend
| Propriété              | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `backend.image`        | Image Docker du backend BPMN Diff.                                       |
| `backend.gitlab.token` | Token d’accès personnel GitLab utilisé pour interagir avec l’API GitLab. |
| `backend.gitlab.url`   | URL de l’instance GitLab cible.                                          |

Ingress / Routes
| Propriété           | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `ingress.enabled`   | Active ou désactive la création des ressources Ingress. |
| `ingress.openshift` | Indique si le déploiement est effectué sur OpenShift. Pour créer des routes à la place d'ingress  |
| `ingress.keycloak`  | Nom de domaine exposant le service Keycloak.            |
| `ingress.frontend`  | Nom de domaine exposant le frontend.                    |
| `ingress.backend`   | Nom de domaine exposant le backend.                     |

Image Pull Secrets

| Propriété          | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `imagePullSecrets` | Liste des secrets Kubernetes utilisés pour pull des images depuis un registre privé (optionnel). |


## Installation
### Sur Kind (kubernetes in docker)

#### Prérequis

- Helm v3+
- Docker
- Kind
- Kubectl

#### Contraintes de configuration

- ingress.openshift doit être défini à false
- ingress.enabled doit être activé (true) pour permettre la création des ingress
- backend.gitlab.token doit être défini avec un access token disposant des droits sur les projets que vous souhaitez analyser.

#### Étapes

1. Exécuter le script fourni :

```bash
./setup.sh
```

Ce script :
- Crée le cluster Kind
- Installe le chart Helm
- Configure l’Ingress
- Rend les services accessibles en local

2. Attendre que les ressources soient démarrées

Une fois terminé, les applications sont accessibles via les domaines définis dans `values.yaml`.

3. Configuration du fichier d'host
   
Cette étape permet d’associer les noms DNS utilisés par l’application à votre machine locale.

Selon votre système d’exploitation, le fichier hosts se trouve à l’emplacement suivant :
- Linux / macOS : /etc/hosts
- Windows : C:\Windows\System32\drivers\etc\hosts

L’édition de ce fichier nécessite des droits administrateur.
- Ouvrez le fichier hosts avec un éditeur de texte en mode administrateur.
- Repérez les valeurs des champs ingress dans le fichier values de votre déploiement (Helm).
- Ajoutez trois entrées pointant vers `127.0.0.1` en utilisant les noms DNS définis dans ces champs.

Exemple:
```
127.0.0.1 keycloak.localhost
127.0.0.1 bpmndiff.localhost
127.0.0.1 backend.localhost
```

4. Ajout d’un utilisateur

- Accéder à l’interface Keycloak : voir ingress.keycloak du fichier de values.

- S’authentifier avec les identifiants administrateur retrouvable dans le fichier de values.

- Sélectionner le realm `bpmn-diff`

- Aller dans :  Users → Create user

- Renseigner les informations de l’utilisateur ainsi que ses credentials

Cette utilisateur pourra être utilisé pour se connecter aux IHM de BPMN Diff.

5. Tester l'installation

Accédez à `ingress.frontend` mentionné dans le fichier de values, vous serez redirigé vers Keycloak, puis, une fois connecté, vers une page Not Found, car vous n’avez pas renseigné les paramètres de l’analyse (numéro du projet GitLab, mode de comparaison et branches).
Voir la section Utilisation.

### Sur Openshift / Kubernetes

#### Prérequis

- Helm v3+
- OC CLI / Kubectl
- Cluster Openshift

#### Contraintes de configuration

- ingress.openshift doit être défini à true si vous déployez sur OpenShift, et à false pour un cluster Kubernetes standard
- ingress.enabled doit être activé (true) pour permettre la création des ingress/Routes
- backend.gitlab.token doit être défini avec un access token disposant des droits sur les projets que vous souhaitez analyser.

#### Étapes

1. Connecter vous à votre cluster 

2. Installer la chart Helm

```bash
helm upgrade --install bpmn-diff ./helm -f ./helm/values.yaml -n <VOTRE_NAMESPACE>
```

3. Attendre que les ressources soient démarrées

3. Vérifier les ressources

Tous les pods doivent être démarré.

```bash
kubectl get pods -n <VOTRE_NAMESPACE>
```

4. Ajout d’un utilisateur

- Accéder à l’interface Keycloak : voir ingress.keycloak du fichier de values.

- S’authentifier avec les identifiants administrateur retrouvable dans le fichier de values.

- Sélectionner le realm `bpmn-diff`

- Aller dans :  Users → Create user

- Renseigner les informations de l’utilisateur ainsi que ses credentials

Cette utilisateur pourra être utilisé pour se connecter aux IHM de BPMN Diff.

5. Tester l'installation

Accédez à `ingress.frontend` mentionné dans le fichier de values, vous serez redirigé vers Keycloak, puis, une fois connecté, vers une page Not Found, car vous n’avez pas renseigné les paramètres de l’analyse (numéro du projet GitLab, mode de comparaison et branches).
Voir la section Utilisation.

## Désinstallation

```bash
helm uninstall bpmn-diff -n <VOTRE_NAMESPACE>
```
