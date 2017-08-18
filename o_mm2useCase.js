//This script writes out a list of text in the current mindmap.
//The format is like a WiKi.

// KM1:　Alt＋return の入力は、LF (0x0a)
// KM2:    そもそも、Macでは、'\', '¥' は使い分けが必要だった・・・・・・ Option + ¥ , ¥ 　Trapだね


var depth = 0;
var INDENT_STR = '  '; //2 spaces
var ITEM_MARKER_STR = '* ';

run();

exit;
function run() {
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model,
            com.change_vision.jude.api.inf.project,
            com.change_vision.jude.api.inf.presentation,
            com.change_vision.jude.api.inf.editor)) {

        var projectAccessor = ProjectAccessorFactory.getProjectAccessor();
        var diagramViewManager = projectAccessor.getViewManager().getDiagramViewManager();
        var currentDiagram = diagramViewManager.getCurrentDiagram();
        var selectedEntities = diagramViewManager.getSelectedPresentations();
        
        var firstestMM = getFirstSelectedName(selectedEntities);
        // MindMap でのみ動作
        if (!(currentDiagram instanceof IMindMapDiagram)){
            print ("open mindmap and run again.");
            return;
        }
        var mmRoot = currentDiagram.getRoot();
        var mmChildren = mmRoot.getChildren();

        var newDiagramName = "";
        if ( isMMDiagramName){
            newDiagramName= currentDiagram.getName();
        }else{
            if (firstestMM != null){
                newDiagramName= firstestMM.getLabel();
            }
        }

        TransactionManager.beginTransaction();
            
        // MinｄMapと同一名のUseCase図取得
        var foundUseCaseDiagram = projectAccessor.findElements(IUseCaseDiagram.class, newDiagramName);
        var iuseCaseDiagram = null;
        if ( foundUseCaseDiagram.length == 0) {
            // create new 
            var editor = astah.getDiagramEditorFactory().getUseCaseDiagramEditor();
            iuseCaseDiagram = editor.createUseCaseDiagram(astah.getProject(), newDiagramName);
        }else{
            // use existing UseCaseDiagram
            iuseCaseDiagram =foundUseCaseDiagram[0];
        }
        var project = astah.getProject();
        var existingUseCases2 = projectAccessor.findElements(IUseCase.class);
        var existingUseCases = new Array();
        for ( var index in existingUseCases2){
            existingUseCases.push(existingUseCases2[index]);
        }
        var dEditor = astah.getDiagramEditorFactory().getUseCaseDiagramEditor();
        var mEditor = astah.getModelEditorFactory().getUseCaseModelEditor();
        var existingPresentations = iuseCaseDiagram.getPresentations();
        // 現状point Y を制御諦めてるが・・Initial分離して渡して加算制御かな
        var initialPoint2D = new java.awt.geom.Point2D.Double(10.0, existingPresentations[0].getHeight());
       createUseCase(project, mmRoot, selectedEntities, existingUseCases, existingPresentations, dEditor, mEditor, initialPoint2D);

        TransactionManager.endTransaction();
    }
}
function createUseCase(project, mmItem, selections, existingUseCases, existingPresentations, diagEditor, modelEditor, point){
    var mmChildren = mmItem.getChildren();
    var currentPoint = new java.awt.geom.Point2D.Double(point.getX() + 150.0, existingPresentations[0].getHeight());
//    print(mmChildren + " : " + mmChildren.length);
    for(var mmIndex in mmChildren){
        var mmChild = mmChildren[mmIndex];
        createUseCase(project, mmChild, selections, existingUseCases, existingPresentations, diagEditor,  modelEditor, currentPoint);
        // 選択中のMindMap要素のみに処理
        var str = new String(mmChild);
        if (str.match(/\r?\n/) == null){
            if (hasPresentation(selections, mmChild)){
                print("selected " + mmChild  + mmChild.getModel());

                // mindmap に対応したUsecaseModelを取得or 生成
                var ucChild = null;
                if (hasItem(existingUseCases, mmChild)){
                    ucChild = getItem(existingUseCases, mmChild);
                }else {
                    ucChild = modelEditor.createUseCase(project, mmChild);
                    existingUseCases.push(mmChild);
                    // 新規追加時のみ相互Hyperlink生成 
                    // 現状、MindMapへのLinkが作れない・・吐き出しは元の機能を使って、ここでは表示だけの追加に絞るかな・・
//                    ucChild.createFileHyperlink(mmChild,mmRoot, null);    
                    mmChild.createElementHyperlink(ucChild, null);
                }
                // ユースケース図上に表示追加:  抑制する場合にはこれが必要
                //            if (hasPresentation(existingPresentations, mmChild)){
                var uItem = diagEditor.createNodePresentation(ucChild, currentPoint);
            }else{
                //print("not selected " + mmChild );
            }
        }else{
            print(str + " is not executed cause of return code existed.");
        }
        currentPoint.setLocation(currentPoint.getX(), existingPresentations[0].getHeight());
    }
}

function printType(obj){
    return print(Object.prototype.toString.apply(obj));
}
function getFirstSelectedName(selections){
    var currentSize = 0;
    var biggestFontObj = null;
    for(var sIndex in selections){
        if (selections[sIndex].getType() == 'Topic') { //skip MMBoundary        
            if (currentSize < selections[sIndex].getProperty("font.size")){
                biggestFontObj = selections[sIndex];
                currentSize = selections[sIndex].getProperty("font.size");
            }
        }
    }
    return biggestFontObj;
}
function printAllPresentations(_presentations){
    for (var index in _presentations){
        print(_presentations[index]);
    }
}
function printTopics(topic) {
    print(topic[0].getProperties());
    print(topic + " at " + depth);
//    var topics = topic[0].getChildren();
    depth++;
    for (var i in topic) {
        if (topic[i].getType() == 'Topic') { //skip MMBoundary
            printTopics(topic[i]);
        }
    }
    depth--;
}

function printTopicsOriginal(topic) {
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
        if (String(array[index]) ==  name) {
//        if (array[index].getName() == name){
            return array[index];
        }
    }
    return null;
}
function hasPresentation(array, name){
    //print(typeof(array) + " * " + array.length + " : " + name);
    for (var index in array)  {
        //print(String(array[index]) + " vs " + name);
        if (array[index].getType() == 'Topic') { //skip MMBoundary     
            if (array[index] == name) {
                return true;
            }
        }
    }
    return false;
}

function hasItem(array, name){
    for (var index in array)  {
        if (String(array[index]) ==  name) {
//        if (array[index].getName() ==  name) {
            return true;
        }
    }
    return false;
}
function hasItem2(array, name){
    //print(typeof(array) + " / " + array.length + " : " + name);
    for (var index in array)  {
        //print(String(array[index]) + " vs " + name);
        if (array[index].getName() == new String(name)) {
            return true;
        }
    }
    return false;
}
function hasClass(element, className){
    return (' ' + element.className + ' ').replace(/[¥n¥t]/g, ' ').indexOf(' ' + className + ' ') !== -1;
}

//// how to make a class as Javascript
// www.yunabe.jp/docs/javascript_class_in_google.html
Person = function(name, age) {
    this.name = name;
    this.age = age;
}
// define methods by prototype in constructor
Person.prototype.getName = function() {
    return this.name;
}
Person.prototype.sayHello = function() {
    print("Hello I¥'m " + this.getName());
}
// how to use the above class
function howToUseAboveClass() {
    var alice = new Person("Alice", 7);
    alice.sayHello();
}
// inherits
function howToInherits(){
    var inherits = function(childCZtor, parentCtor) {
        // 子クラスのprototypeのプロトタイプとして親クラスのprototypeを指定することで継承が実現される
        Object.setPrototypeOf(childCtor.prototype, paretntCtror,prototype);
        
    };
    var Employee = function(name, age, salary) {
        Person.call(this, name, age);
        this.salary = salary;
    }
    inherits(Employee, Person);
    Employee.prototype.getSalary = function() {
        return this.salary;
    }
    Eployee.prototype.sayHello = function() {
        Person.prototype.sayHello.call(this);
        console.log("Salary is " + this.salary);
    }
}
