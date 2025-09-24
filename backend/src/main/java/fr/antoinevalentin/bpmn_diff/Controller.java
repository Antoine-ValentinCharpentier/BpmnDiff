package fr.antoinevalentin.bpmn_diff;

import org.gitlab4j.api.GitLabApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fr.antoinevalentin.bpmn_diff.services.CompareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
    @Operation(
        summary = "Récupérer les modifications de BPMN entre deux états d'un projet GitLab",
        description = """
            Compare les fichiers BPMN d’un projet GitLab selon deux modes :
            1. Comparaison entre deux branches : fournissez `from`, `to` et le mode de comparaison `mode` (soit exact, soit after-merge).
            2. Comparaison d'une branche spécifique : fournissez `branch` et `baseBranch` (branche qui a initié 'branch').
            """
    )
    public ResponseEntity<?> compareBranches(
        @Parameter(description = "ID du projet GitLab", required = true) @PathVariable Long projectId,
        @Parameter(description = "Nom de la branche source (ancienne). Obligatoire en mode multi-branches") @RequestParam(required = false) String from,
        @Parameter(description = "Nom de la branche cible (nouvelle). Obligatoire en mode multi-branches") @RequestParam(required = false) String to,
        @Parameter(description = "Type de comparaison : exact, after-merge (defaut after-merge). Obligatoire en mode multi-branches") @RequestParam(required = false) String mode,
        @Parameter(description = "Branche unique à analyser. Obligatoire en mode single-branch") @RequestParam(required = false) String branch,
        @Parameter(description = "Branche de référence pour la comparaison de 'branch'. Obligatoire en mode single-branch") @RequestParam(required = false) String baseBranch
    ) {
        log.debug("GET /projects/"+projectId+"/compare");
        boolean multiMode = from != null && !from.isBlank() && to != null && !to.isBlank() && mode != null && !mode.isBlank();
        boolean singleMode = branch != null && !branch.isBlank() && baseBranch != null && !baseBranch.isBlank();
        try {
            if (multiMode && !singleMode) {
                log.debug("Compare : multi branches (mode:"+mode+" ) : "+from+" -> "+to);
                return new ResponseEntity<>(service.compareMultipleBranches(projectId, from, to,  "exact".equals(mode)), HttpStatus.OK);
            } else if(singleMode && !multiMode) {
                log.debug("Compare : single branches "+branch+" (base branch:"+baseBranch+")");
                return new ResponseEntity<>(service.compareSingleBranche(projectId, branch, baseBranch), HttpStatus.OK);
            }
            return new ResponseEntity<>(
                "Vous devez fournir soit les paramètres 'from', 'to' et 'mode' pour le mode multi-branches, soit 'branch' et 'baseBranch' pour le mode single-branch.", 
                HttpStatus.BAD_REQUEST
            );          
        } catch (GitLabApiException e){
            return new ResponseEntity<>("Erreur GitLab : "+e.getMessage(), HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            return new ResponseEntity<>("Erreur Serveur : "+e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}