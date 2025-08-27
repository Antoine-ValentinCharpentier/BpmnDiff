package fr.antoinevalentin.bpmn_diff;

import fr.antoinevalentin.bpmn_diff.services.CompareService;
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
    public String hello(){
        return "hello";
    }

    @GetMapping("/projects/{projectId}/compare")
    public ResponseEntity<?> compareBranches(
            @PathVariable Long projectId,
            @RequestParam String from,
            @RequestParam String to
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