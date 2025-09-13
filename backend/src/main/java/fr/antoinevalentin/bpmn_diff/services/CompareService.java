package fr.antoinevalentin.bpmn_diff.services;

import fr.antoinevalentin.bpmn_diff.data.BpmnFileChange;
import fr.antoinevalentin.bpmn_diff.data.ChangeType;
import org.gitlab4j.api.GitLabApiException;
import org.gitlab4j.api.models.CompareResults;
import org.gitlab4j.api.models.Diff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
    public List<BpmnFileChange> compare(Long projectId, String from, String to) throws GitLabApiException {
        CompareResults gitlabDiff = gitlabService.compareBranches(projectId, from, to);

        List<BpmnFileChange> allChanges = new ArrayList<>();

        for (Diff diff : gitlabDiff.getDiffs()) {
            if (diff.getNewPath().toLowerCase().endsWith(".bpmn") || diff.getOldPath().toLowerCase().endsWith(".bpmn")) {
                allChanges.add(mapDiffToBpmnChange(projectId, from, to, diff));
            }
        }

        return allChanges;
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
