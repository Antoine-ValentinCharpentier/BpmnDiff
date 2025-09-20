package fr.antoinevalentin.bpmn_diff.services;

import java.util.ArrayList;
import java.util.List;

import org.gitlab4j.api.GitLabApiException;
import org.gitlab4j.api.models.CompareResults;
import org.gitlab4j.api.models.Diff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fr.antoinevalentin.bpmn_diff.data.BpmnFileChange;
import fr.antoinevalentin.bpmn_diff.data.ChangeType;

/**
 * Service pour comparer deux branches d'un projet GitLab et extraire les changements
 * spécifiques aux fichiers BPMN.
 */
@Service
public class CompareService {

    @Autowired
    private GitlabService gitlabService;

    /**
     * Compare deux branches d’un projet GitLab et retourne l’ensemble des fichiers BPMN
     * ayant été modifiés entre ces deux branches (ajoutés, supprimés ou mis à jour).
     *
     * @param projectId l'identifiant du projet GitLab
     * @param from      le nom de la branche source
     * @param to        le nom de la branche cible
     * @return une liste d’objets {@link BpmnFileChange} décrivant les fichiers BPMN impactés, 
     *         ainsi que le type de modification appliqué (ajout, suppression ou mise à jour)
     * @throws GitLabApiException si une erreur survient lors de la récupération des différences/fichiers depuis GitLab
     */
    public List<BpmnFileChange> compareMultipleBranches(Long projectId, String from, String to) throws GitLabApiException {
        CompareResults gitlabDiff = gitlabService.compare(projectId, from, to);
        return extractBpmnChanges(projectId, from, to, gitlabDiff);
    }

    public List<BpmnFileChange> compareSingleBranche(Long projectId, String targetBranch, String startingBranch) throws GitLabApiException {
        String from = gitlabService.getFirstCommitInsideBranch(projectId, targetBranch, startingBranch);
        System.out.println(from);
        String to = gitlabService.getLastCommitInsideBranch(projectId, targetBranch);
        System.out.println(to);
        CompareResults gitlabDiff = gitlabService.compare(projectId, from, to);

        return extractBpmnChanges(projectId, from, to, gitlabDiff);
    }

    /**
     * Extrait les modifications BPMN présentes dans un {@link CompareResults}.
     * <p>
     * Cette méthode filtre uniquement les fichiers ayant l’extension <code>.bpmn</code>,
     * puis les transforme en objets {@link BpmnFileChange}.
     *
     * @param projectId  identifiant du projet GitLab
     * @param from       branche ou commit de départ
     * @param to         branche ou commit de destination
     * @param gitlabDiff résultat de la comparaison entre deux branches/commits
     * @return une liste de changements spécifiques aux fichiers BPMN
     * @throws GitLabApiException si une erreur survient lors de la récupération du contenu des fichiers
     */
    private List<BpmnFileChange> extractBpmnChanges(Long projectId, String from, String to, CompareResults gitlabDiff) throws GitLabApiException {
        List<BpmnFileChange> allChanges = new ArrayList<>();
        for (Diff diff : gitlabDiff.getDiffs()) {
            if (isBpmnFile(diff)) {
                allChanges.add(mapDiffToBpmnChange(projectId, from, to, diff));
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
     * @return un objet {@link BpmnFileChange} avec les chemins et contenus avant/après
     * @throws GitLabApiException si une erreur survient lors de la récupération du contenu du fichier
     */
    private BpmnFileChange mapDiffToBpmnChange(Long projectId, String from, String to, Diff diff) throws GitLabApiException {
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
            change.setXmlAfter(gitlabService.getFileContent(projectId, diff.getNewPath(), to));
            change.setChangeType(ChangeType.UPDATED);
        }

        return change;
    }

}
