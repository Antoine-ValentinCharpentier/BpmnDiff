package fr.antoinevalentin.bpmn_diff;

import fr.antoinevalentin.bpmn_diff.services.CompareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.gitlab4j.api.GitLabApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {

    @Autowired
    private CompareService service;

    @GetMapping("/")
    @Operation(summary = "Hello world", description = "Endpoint de test pour vérifier que le service fonctionne")
    public String hello(){
        return "hello";
    }

    @GetMapping("/projects/{projectId}/compare")
    @Operation(summary = "Comparer Les bpmn de deux branches d'un projet Gitlab", description = "Retourne les différences de BPMN entre les branches `from` et `to` d'un projet GitLab")
    public ResponseEntity<?> compareBranches(
        @Parameter(description = "ID du projet GitLab") @PathVariable Long projectId,
        @Parameter(description = "Nom de la branche source (ancienne)") @RequestParam String from,
        @Parameter(description = "Nom de la branche cible (nouvelle)") @RequestParam String to
    ) {
        try {
            return new ResponseEntity<>(service.compare(projectId, from, to), HttpStatus.OK);
        } catch (GitLabApiException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}