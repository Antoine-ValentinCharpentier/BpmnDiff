package fr.antoinevalentin.bpmn_diff.data;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Résultat d'une comparaison entre deux branches pour les fichiers BPMN.
 * Contient les fichiers ajoutés, supprimés et modifiés.
 */
@Data
@AllArgsConstructor
public class BpmnCompareResult {

    private List<BpmnFileChange> added;

    private List<BpmnFileChange> updated;

    private List<BpmnFileChange> deleted;

}
