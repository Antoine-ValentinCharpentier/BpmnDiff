package fr.antoinevalentin.bpmn_diff.data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

/**
 * Représente un changement sur un fichier BPMN entre deux branches.
 * Contient les chemins avant et après, ainsi que le contenu XML correspondant.
 */
@Data
public class BpmnFileChange {

    private String fileNameBefore;

    private String fileNameAfter;

    private String xmlBefore;

    private String xmlAfter;

    @JsonIgnore
    private ChangeType changeType;

}
