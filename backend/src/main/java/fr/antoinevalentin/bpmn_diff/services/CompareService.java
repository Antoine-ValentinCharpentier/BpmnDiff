package fr.antoinevalentin.bpmn_diff.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.gitlab4j.api.GitLabApiException;
import org.gitlab4j.api.models.CompareResults;
import org.gitlab4j.api.models.Diff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fr.antoinevalentin.bpmn_diff.data.BpmnFileChange;
import fr.antoinevalentin.bpmn_diff.data.ChangeType;
import lombok.extern.slf4j.Slf4j;

/**
 * Service pour comparer deux branches d'un projet GitLab et extraire les changements
 * spécifiques aux fichiers BPMN.
 */
@Slf4j
@Service
public class CompareService {

    @Autowired
    private GitlabService gitlabService;

    /**
     * Compare deux branches d’un projet GitLab et retourne l’ensemble des fichiers BPMN
     * ayant été modifiés entre ces deux branches (ajoutés, supprimés ou mis à jour).
     *
     * @param projectId        l'identifiant du projet GitLab
     * @param from             le nom de la branche source
     * @param to               le nom de la branche cible
     * @param isExactMode        Si la comparaison doit s'effectuer sur les bpmns brutes sans modification (true), si la comparaison doit s'effectuer après merge (false)
     * @return une liste d’objets {@link BpmnFileChange} décrivant les fichiers BPMN impactés, 
     *         ainsi que le type de modification appliqué (ajout, suppression ou mise à jour)
     * @throws GitLabApiException si une erreur survient lors de la récupération des différences/fichiers depuis GitLab
     */
    public List<BpmnFileChange> compareMultipleBranches(Long projectId, String from, String to, boolean isExactMode) throws GitLabApiException {
        CompareResults gitlabDiff = gitlabService.compare(projectId, from, to);
        return extractBpmnChanges(projectId, from, to, gitlabDiff, isExactMode);
    }

    /**
     * Compare les BPMN d'une branche unique. La comparaison se base uniquement sur les commits qui ont était rajouté après la création de la branche.
     *
     * @param projectId      identifiant du projet GitLab
     * @param targetBranch   la branche cible (celle dans laquelle on veut analyser les commits)
     * @param startingBranch la branche de référence qui a initié la branche targetBranch
     * @return une liste d’objets {@link BpmnFileChange} décrivant les fichiers BPMN impactés
     * @throws GitLabApiException si une erreur survient lors de la récupération des commits ou différences depuis GitLab
     */
    public List<BpmnFileChange> compareSingleBranche(Long projectId, String targetBranch, String startingBranch) throws GitLabApiException {
        String from = gitlabService.getFirstCommitInsideBranch(projectId, targetBranch, startingBranch);
        log.debug("Starting commit branch : "+from);
        String to = gitlabService.getLastCommitInsideBranch(projectId, targetBranch);
        log.debug("HEAD commit branch : "+to);
        CompareResults gitlabDiff = gitlabService.compare(projectId, from, to);

        return extractBpmnChanges(projectId, from, to, gitlabDiff, true);
    }

    /**
     * Extrait les modifications BPMN présentes dans un {@link CompareResults}.
     * <p>
     * Cette méthode filtre uniquement les fichiers ayant l’extension <code>.bpmn</code>,
     * puis les transforme en objets {@link BpmnFileChange}.
     *
     * @param projectId        identifiant du projet GitLab
     * @param from             branche ou commit de départ
     * @param to               branche ou commit de destination
     * @param gitlabDiff       résultat de la comparaison entre deux branches/commits
     * @param isExactMode        Si la comparaison doit s'effectuer sur les bpmns brutes sans modification (true), si la comparaison doit s'effectuer après merge (false)
     * @return une liste de changements spécifiques aux fichiers BPMN
     * @throws GitLabApiException si une erreur survient lors de la récupération du contenu des fichiers
     */
    private List<BpmnFileChange> extractBpmnChanges(Long projectId, String from, String to, CompareResults gitlabDiff, boolean isExactMode) throws GitLabApiException {
        List<BpmnFileChange> allChanges = new ArrayList<>();
        for (Diff diff : gitlabDiff.getDiffs()) {
            if (isBpmnFile(diff)) {
                allChanges.add(mapDiffToBpmnChange(projectId, from, to, diff, isExactMode));
            }
        }
        return allChanges;
    }

    /**
     * Vérifie si un {@link Diff} correspond à un fichier BPMN,
     * en se basant sur son chemin avant et après modification.
     *
     * @param diff objet représentant un fichier modifié dans GitLab entre deux branches
     * @return {@code true} si le fichier est un BPMN, {@code false} sinon
     */
    private boolean isBpmnFile(Diff diff) {
        return (diff.getNewPath() != null && diff.getNewPath().toLowerCase().endsWith(".bpmn"))
            || (diff.getOldPath() != null && diff.getOldPath().toLowerCase().endsWith(".bpmn"));
    }

    /**
     * Transforme un objet {@link Diff} provenant de GitLab en {@link BpmnFileChange}.
     * <p>
     * Cette méthode récupère le contenu complet du fichier BPMN avant et après la modification.
     * Dans le cas d'un ajout, xmlBefore vaut une chaîne vide.
     * Dans le cas d'une suppression, xmlAfter vaut une chaîne vide.
     *
     * @param projectId l'identifiant du projet GitLab
     * @param from      le nom de la branche source
     * @param to        le nom de la branche cible
     * @param diff      l'objet {@link Diff} représentant un fichier modifié
     * @param isExactMode        Si la comparaison doit s'effectuer sur les bpmns brutes sans modification (true), si la comparaison doit s'effectuer après merge (false)
     * @return un objet {@link BpmnFileChange} avec les chemins et contenus avant/après
     * @throws GitLabApiException si une erreur survient lors de la récupération du contenu du fichier
     */
    private BpmnFileChange mapDiffToBpmnChange(Long projectId, String from, String to, Diff diff, boolean isExactMode) throws GitLabApiException {
        BpmnFileChange change = new BpmnFileChange();

        change.setFileNameBefore(diff.getOldPath());
        change.setFileNameAfter(diff.getNewPath());

        if (Boolean.TRUE.equals(diff.getNewFile())) {
            change.setXmlBefore("");
            change.setXmlAfter(gitlabService.getFileContent(projectId, diff.getNewPath(), to));
            change.setChangeType(ChangeType.ADDED);
        } else if (Boolean.TRUE.equals(diff.getDeletedFile())) {
            change.setXmlBefore(gitlabService.getFileContent(projectId, diff.getOldPath(), from));
            change.setXmlAfter("");
            change.setChangeType(ChangeType.DELETED);
        } else {
            change.setXmlBefore(gitlabService.getFileContent(projectId, diff.getOldPath(), from));
            if (isExactMode) {
                change.setXmlAfter(gitlabService.getFileContent(projectId, diff.getNewPath(), to));
            } else {
                change.setXmlAfter(applyPatchAutoMerge(change.getXmlBefore(), diff.getDiff()));
            }
            change.setChangeType(ChangeType.UPDATED);
        }

        return change;
    }

    /**
     * Applique un patch de type diff sur un texte BPMN source et retourne le résultat après tentative de fusion automatique.
     * 
     * Simule donc un auto merge de Git.
     *
     * <p>Le patch est lu ligne par ligne :
     * <ul>
     *   <li>Les lignes commençant par un espace (" ") sont conservées (pas de modification).</li>
     *   <li>Les lignes commençant par un tiret ("-") sont supprimées du texte source.</li>
     *   <li>Les lignes commençant par un plus ("+") sont ajoutées au résultat.</li>
     * </ul>
     * Les sections de diff sont délimitées par des en-têtes de type
     * <code>@@ -startOld,countOld +startNew,countNew @@</code>.
     *
     * @param sourceBpmn le contenu BPMN original (source, d'avant modification), sous forme de chaîne avec des sauts de ligne
     * @param diffText   le texte du diff (patch), à appliquer sur le contenu source
     * @return une nouvelle chaîne contenant le BPMN après application du patch/auto-merge.
     */
    public String applyPatchAutoMerge(String sourceBpmn, String diffText) {
        List<String> sourceLines = new ArrayList<>(Arrays.asList(sourceBpmn.split("\n", -1)));
        List<String> result = new ArrayList<>();

        String[] diffLines = diffText.split("\n");
        int srcIndex = 0;

        for (int i = 0; i < diffLines.length; i++) {
            String line = diffLines[i];

            if (line.startsWith("@@")) {
                // Exemple: @@ -1,3 +10,5 @@ 
                // commence à la ligne 1 dans l'ancienne version et concerne 3 ligne, dans la nouvelle version commence à la ligne 10 et correspond à 5 lignes dans le hunk 
                String[] parts = line.split(" ");
                String oldInfo = parts[1]; // "-1,3"

                int oldStart = Integer.parseInt(oldInfo.split(",")[0].substring(1)) - 1;
                // on copie les lignes inchangées avant ce hunk
                while (srcIndex < oldStart && srcIndex < sourceLines.size()) {
                    result.add(sourceLines.get(srcIndex++));
                }

                // puis on lit ce hunk
                while (i + 1 < diffLines.length && !diffLines[i + 1].startsWith("@@")) {
                    i++;
                    String diffLine = diffLines[i];

                    if (diffLine.startsWith(" ")) {
                        result.add(sourceLines.get(srcIndex));
                        srcIndex++; // ligne ni ajoutée, ni supprimée
                    } else if (diffLine.startsWith("-")) {
                        srcIndex++; // ligne supprimée
                    } else if (diffLine.startsWith("+")) {
                        result.add(diffLine.substring(1)); // ligne ajoutée
                    }
                }
            }
        }

        // ajouter le reste du fichier
        while (srcIndex < sourceLines.size()) {
            result.add(sourceLines.get(srcIndex++));
        }

        return String.join("\n", result);
    }

}
