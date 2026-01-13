# BPMN-Diff

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

## 3. Installation

Lancer la commande suivante à la racine du projet :

```bash
docker compose up --build
```

## 4. Ajout d’un utilisateur

1. Accéder à l’interface Keycloak : [http://localhost:18000](http://localhost:18000)

2. S’authentifier avec les identifiants administrateur :

   * Username : `admin`
   * Password : `admin`

3. Sélectionner le realm `bpmn-diff`

4. Aller dans :  Users → Create user

5. Renseigner les informations de l’utilisateur ainsi que ses credentials

Cette utilisateur pourra être utilisé pour se connecter aux IHM de BPMN Diff.

# Installation sur Kind (kubernetes in docker)

> Work in progress : l’installation sur Kind 

# Installation sur Openshift

> Work in progress : l’installation sur OpenShift 