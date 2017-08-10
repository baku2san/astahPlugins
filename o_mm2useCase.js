//This script writes out a list of text in the current mindmap.
//The format is like a WiKi.

var depth = 0;
var INDENT_STR = '  '; //2 spaces
var ITEM_MARKER_STR = '* ';

run();

function run() {
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model,
            com.change_vision.jude.api.inf.project)) {

        var diagramViewManager = astah.getViewManager().getDiagramViewManager();
        var currentDiagram = diagramViewManager.getCurrentDiagram();
        // MindMap でのみ動作
        if (!(currentDiagram instanceof IMindMapDiagram)){
            print ("open mindmap and run again.");
            return;
        }
        var newDiagramName= currentDiagram.getName();
        
        var projectAccessor = ProjectAccessorFactory.getProjectAccessor();
        var foundUseCaseDiagram = projectAccessor.findElements(IUseCaseDiagram.class, newDiagramName);
        var iuseCaseDiagram = null;
        if ( foundUseCaseDiagram.length == 0) {
            // create new 
            with(new JavaImporter(
                    com.change_vision.jude.api.inf.editor)) {
                TransactionManager.beginTransaction();
                var editor = astah.getDiagramEditorFactory().getUseCaseDiagramEditor();
                iuseCaseDiagram = editor.createUseCaseDiagram(astah.getProject(), newDiagramName);
                TransactionManager.endTransaction();
            }
        }else{
            // use existing UseCaseDiagram
            iuseCaseDiagram =foundUseCaseDiagram[0];
        }

        var existingUseCases = projectAccessor.findElements(IUseCase.class);
        
        // 選択中のMindMapを取得
        with(new JavaImporter(
                com.change_vision.jude.api.inf.editor,
                java.awt.geom )) {
            var project = astah.getProject();
            TransactionManager.beginTransaction();
            var editor = astah.getDiagramEditorFactory().getUseCaseDiagramEditor();
            var mEditor = astah.getModelEditorFactory().getUseCaseModelEditor();
            var selectedEntities = diagramViewManager.getSelectedPresentations();
            var presentations = iuseCaseDiagram.getPresentations();
 
            print(presentations);
            var iUseCase = null;
            for ( var sIndex in selectedEntities){
                var sItem = selectedEntities[sIndex];
                print(sItem + " in " +  presentations.length + " @ " + iuseCaseDiagram);
                // MindMapからUseCaseを追加：モデルの追加
                if (hasItem(existingUseCases, sItem)){
                    print("already existed as " + sItem);
                    iUseCase = getItem(existingUseCases, sItem);
                    // do nothing cause of existing as UseCase
                }else {
                    print("add");
                    editor.setDiagram(iuseCaseDiagram);
                    iUseCase = mEditor.createUseCase(project, sItem);
                }
                // 対象ユースケース図上への追加：表示の追加
                if (hasPresentation(presentations, sItem)){
                    print("already existed as presentation : " + sItem);
                }else {
                    print("??");
                    var uItem = editor.createNodePresentation(iUseCase, new Point2D.Double(10.0, 10.0));
                    print(uItem);
                }
            }
            TransactionManager.endTransaction();
        }
        return;
        // 対象UseCase図の内容を取得
        for ( index in presentations){
            print(presentations[index]);
        }
        var inamed =currentDiagram instanceof INamedElement
        if (inamed != null){
            print(inamed);
        }


//        var projectViewManager = astah.getViewManager().getProjectViewManager();
        

    
        depth = 0;
//        printTopics(rootTopic);
    }
}

function printTopics(topic) {
    var topicLabel = topic.getLabel().replaceAll('\n', ' ');
    print(getIndent(depth) + ITEM_MARKER_STR + topicLabel);

    var topics = topic.getChildren();
    depth++;
    for (var i in topics) {
        if (topics[i].getType() == 'Topic') { //skip MMBoundary
            printTopics(topics[i]);
        }
    }
    depth--;
}

function getIndent(depth) {
    var indent = '';
    for (var i = 0; i < depth; i++) {
        indent += INDENT_STR;
    }
    return indent;
}
function getItem(array, name){
    for (var index in array)  {
        if (array[index] == name){
            return array[index];
        }
    }
    return null;
}
function hasPresentation(array, name){
    //print(typeof(array) + " * " + array.length + " : " + name);
    for (var index in array)  {
        //print(String(array[index]) + " vs " + name);
        if (array[index] == name) {
            print("found");
            return true;
        }
    }
    print("not found");
    return false;
}
function hasItem(array, name){
    print(typeof(array) + " / " + array.length + " : " + name);
    for (var index in array)  {
        print(String(array[index]) + " vs " + name);
        if (array[index].getName() == new String(name)) {
            return true;
        }
    }
    return false;
}
function hasClass(element, className){
    return (' ' + element.className + ' ').replace(/[¥n¥t]/g, ' ').indexOf(' ' + className + ' ') !== -1;
}

