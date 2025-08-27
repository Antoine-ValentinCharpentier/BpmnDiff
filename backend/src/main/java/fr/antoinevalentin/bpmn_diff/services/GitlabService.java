package fr.antoinevalentin.bpmn_diff.services;

import org.gitlab4j.api.GitLabApi;
import org.gitlab4j.api.GitLabApiException;
import org.gitlab4j.api.models.CompareResults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import org.gitlab4j.api.models.RepositoryFile;
import java.util.Base64;

/**
 * Service pour interagir avec l'API GitLab.
 * <p>
 * Permet de comparer des branches et de récupérer le contenu des fichiers du dépôt.
 */
@Service
public class GitlabService {

    private final GitLabApi gitLabApi;

    /**
     * Initialise le service GitLab avec l'URL et le token privé.
     *
     * @param hostUrl      l'URL de l'instance GitLab (ex : https://gitlab.com)
     * @param privateToken le token privé pour authentification API
     */
    @Autowired
    public GitlabService(
            @Value("${gitlab.url}") String hostUrl,
            @Value("${gitlab.token}") String privateToken
    ) {
        this.gitLabApi = new GitLabApi(hostUrl, privateToken);
    }

    /**
     * Compare deux branches d'un projet GitLab avec le paramètre 'straight' par défaut à false.
     *
     * @param projectId l'identifiant du projet GitLab
     * @param from      le nom de la branche source
     * @param to        le nom de la branche cible
     * @return un objet {@link CompareResults} contenant la liste des fichiers modifiés, ajoutés ou supprimés
     * @throws GitLabApiException si une erreur survient lors de l'appel à l'API GitLab
     */
    public CompareResults compareBranches(Long projectId, String from, String to) throws GitLabApiException {
        return gitLabApi.getRepositoryApi().compare(projectId, from, to, projectId, false);
    }

    /**
     * Récupère le contenu complet d'un fichier dans une branche donnée.
     * <p>
     * Le contenu est décodé depuis Base64 pour retourner le texte lisible.
     *
     * @param projectId l'identifiant du projet GitLab
     * @param filePath  le chemin du fichier dans le dépôt
     * @param branch    la branche dans laquelle récupérer le fichier
     * @return le contenu complet du fichier décodé en texte
     * @throws GitLabApiException si une erreur survient lors de l'accès au fichier via l'API GitLab
     */
    public String getFileContent(Long projectId, String filePath, String branch) throws GitLabApiException {
        RepositoryFile file = gitLabApi.getRepositoryFileApi().getFile(projectId, filePath, branch);
        return new String(Base64.getDecoder().decode(file.getContent()));
    }

}
