//This script writes out a list of text in the current mindmap.
//The format is like a WiKi.

// KM1:　Alt＋return の入力は、LF (0x0a)
// KM2:    そもそも、Macでは、'\', '¥' は使い分けが必要だった・・・・・・ Option + ¥ , ¥ 　Trapだね

// hasSameElement(String name, Class clazz)  プロジェクト内で同名Objがあるか？　Class省略も可能。これ使えばよかった

var depth = 0;
var INDENT_STR = '  '; //2 spaces
var ITEM_MARKER_STR = '* ';

run();

exit;
function run() {
    with(new JavaImporter(
            com.change_vision.jude.api.inf,
            com.change_vision.jude.api.inf.model,
            com.change_vision.jude.api.inf.project,
            com.change_vision.jude.api.inf.editor)) {

        var projectAccessor = AstahAPI.getAstahAPI().getProjectAccessor();
        var currentProject = projectAccessor.getProject();
        var dEditor = astah.getDiagramEditorFactory().getUseCaseDiagramEditor();
        var mEditor = astah.getModelEditorFactory().getUseCaseModelEditor();
        var bEditor = astah.getModelEditorFactory().getBasicModelEditor();
        var elements = (currentProject.getOwnedElements());
        
        TransactionManager.beginTransaction();
        for (var index in elements){
            if (elements[index].getPresentations().length == 0
                && (elements[index] instanceof  IUseCase) ){

                if (true){
                    var originalName =elements[index].getName();
                    var hLinks = elements[index].getHyperlinks();
                    for (var hIndex in hLinks){
                        if (hLinks[hIndex].isModel){
                            var modelId = hLinks[hIndex].getName();
                            var linkedModel = projectAccessor.getEntity(modelId);
                            var linkedHLinks = linkedModel.getHyperlinks();
                            // Hyperlink先に参照がある場合は、そいつを削除
                            for (var linkedHIndex in linkedHLinks){
                                if (linkedHLinks[linkedHIndex].isModel()){
                                    var linkedModelId = linkedHLinks[linkedHIndex].getName();
                                    if (projectAccessor.getEntity(linkedModelId) == originalName){
                                        print("deleted link from ... " + linkedModel);
                                        linkedModel.deleteHyperlink(linkedHLinks[linkedHIndex]);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    print("deleted : " + elements[index]);
                    bEditor.delete(elements[index]);
                }
            }
        }
        TransactionManager.endTransaction();
        return;
    }
}
        /*            
                print(elements[index] + " : " + elements[index].getHyperlinks().length
                                                  + " : " + elements[index].getPresentations().length
                                              + " : " + elements[index].getStereotypes().length 
                                              + " : " + elements[index].getClientDependencies().length
                                              + ", " + elements[index].getClientRealizations().length
                                              + ", " + elements[index].getClientUsages().length
                                              + " , " + elements[index].getConstraints().length  
                                              + " , " + elements[index].getDiagrams().length 
                                              + " , " + elements[index].getSupplierDependencies().length 
                                              + " , " + elements[index].getSupplierRealizations().length
                                              + " , " + elements[index].getSupplierUsages().length );
*/