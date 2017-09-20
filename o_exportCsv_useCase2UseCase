//This script writes out a list of text in the current mindmap.
//The format is like a WiKi.

// KM1:　Alt＋return の入力は、LF (0x0a)
// KM2:    そもそも、Macでは、'\', '¥' は使い分けが必要だった・・・・・・ Option + ¥ , ¥ 　Trapだね
// KM3:    return in cell of Excel : CR(0x0d)
// hasSameElement(String name, Class clazz)  プロジェクト内で同名Objがあるか？　Class省略も可能。これ使えばよかった

var depth = 0;
var INDENT_STR = '  '; //2 spaces
var ITEM_MARKER_STR = '* ';

run();

exit;
function run() {
    exportClassesInCsv();    
    return;
    printActor();
    return;
}
function printActor(){
    // 動作検証用テストコード
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model)) {
        //classes = astah.findElements(IClass.class);
        
        classes = projectAccessor.findElements(IUseCase.class);
    }
    for (var index in classes){        // Classes 
        var clazz = classes[index];

    //        print(clazz.getName());
        if (true){
            // 出現する図の一覧
            var pNames = "";
            var presentations = clazz.getPresentations();
            for (var pIndex in presentations){
                var presentation = presentations[pIndex];
                pNames = pNames + presentation.getDiagram().getName() + ",";
            }
            
            // 接続するActorとUseCaseの一覧
            var aNames = "";
            var uNames = "";
            var classAttributes = clazz.getAttributes ();
//            print(" -" + classAttributes.length + "-    " + clazz + " ... " + clazz.getDefinition());
            for(var aIndex in classAttributes){        // attribute in attributes of each class
                var classAttribute = classAttributes[aIndex];
                var connectedClass = classAttribute.getType();
                
                var types = connectedClass.getStereotypes();
                var isActor = false;
                for (var tIndex in types){
                    if (types[tIndex] == "actor"){
                        isActor = true;         
                        break;
                    }
                }
                if (connectedClass.getName() == "FDC分析ツール"){
                    if ( connectedClass instanceof com.change_vision.jude.api.inf.model.ISubsystem){
                        print("isub " + connectedClass.getName());
                    }
                }
                if (isActor){
                    aNames = aNames + connectedClass.getName() + ",";
                }else {
                    uNames = uNames + connectedClass.getName() + ",";
                }
            }

      //      print("   -> "+ pNames + " // " + aNames + " -- " + uNames);
        }
    }
}

function exportClassesInCsv() {
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model)) {
        //classes = astah.findElements(IClass.class);
        
        classes = projectAccessor.findElements(IUseCase.class);
    }
 
    var csvFile = selectCsvFile();
    if (csvFile == null) {
        print('Canceled');
        return;
    }
    print('Selected file = ' + csvFile.getAbsolutePath());
    if (csvFile.exists()) {
        var msg = "Do you want to overwrite?";
        var ret = javax.swing.JOptionPane.showConfirmDialog(scriptWindow, msg);
        if (ret != javax.swing.JOptionPane.YES_OPTION) {
            print('Canceled');
            return;
        }
    }
 
    with(new JavaImporter(
            java.io)) {
        var writer = new BufferedWriter(new FileWriter(csvFile));
        var delimiter = ",";    //        delimiter = "\r";    ExcelのCell内改行をしたい場合
        for(var i in classes) {
            var clazz = classes[i];

            // 出現する図の一覧
            var pNames = [];
            var presentations = clazz.getPresentations();
            for (var pIndex in presentations){
                var presentation = presentations[pIndex];
                pNames.push( presentation.getDiagram().getName() );
            }
            
            // 接続するActorとUseCaseの一覧
            var aNames = [];
            var uNames = [];
            var sNames = [];
            var classAttributes = clazz.getAttributes ();
//            print(" -" + classAttributes.length + "-    " + clazz + " ... " + clazz.getDefinition());
            for(var aIndex in classAttributes){        // attribute in attributes of each class
                var classAttribute = classAttributes[aIndex];
                var connectedClass = classAttribute.getType();
                
                var types = connectedClass.getStereotypes();
                var isActor = false;
                for (var tIndex in types){
                    if (types[tIndex] == "actor"){
                        isActor = true;         
                        break;
                    }
                }
                if (isActor){
                    aNames.push( connectedClass.getName() );
                }else {
                    if ( connectedClass instanceof com.change_vision.jude.api.inf.model.ISubsystem){
                        sNames.push( connectedClass.getName() );
                    } else {
                        uNames.push( connectedClass.getName() );
                    }
                }
            }

            // 最長の要素に合わせて、その分の行を出力する。それぞれ別単位なので合わせていいのかという話はあるが、
            // 別にしたり、排他的出力にすると、余計に見難いと判断
            var maxLength = pNames.length;
            if ( aNames.length > maxLength){
                maxLength = aNames.length;
            }  
            if ( uNames.length > maxLength) {
                maxLength = uNames.length;
            }
            if ( sNames.length > maxLength) {
                maxLength = sNames.length;
            }
            for (var len = 0; len < maxLength; len++){
                var aName = "";
                var pName = "";
                var uName = "";
                var sName = "";
                if (aNames.length > len){
                    aName = aNames[len];
                }
                if (pNames.length > len){
                    pName = pNames[len];
                }
                if (uNames.length > len){
                    uName = uNames[len];
                }
                if (sNames.length > len){
                    sName = sNames[len];
                }
                var rowData = [];
                rowData.push(clazz.getName());
                rowData.push(clazz.getDefinition());
                rowData.push(aName);
                rowData.push(pName);
                rowData.push(uName);        
                rowData.push(sName);   
                writeRow(writer, rowData);
            }
        } 
        writer.close();
    }
}
 
function selectCsvFile() {
    with(new JavaImporter(
            java.io,
            javax.swing)) {
        var chooser = new JFileChooser();
        var selected = chooser.showSaveDialog(scriptWindow);
        if (selected == JFileChooser.APPROVE_OPTION) {
            var file = chooser.getSelectedFile();
            if (file.getName().toLowerCase().endsWith('.csv')) {
                return file;
            } else {
                return new File(file.getAbsolutePath() + '.csv');
            }
        } else {
            return null;
        }
    }
}
 
function writeRow(writer, rowData) {
    for (var i in rowData) {
        writeItem(writer, rowData[i]);
        if (i < rowData.length - 1) {
            writer.write(',');
        }
    }
    writer.newLine();
}
 
function writeItem(writer, data) {
    writer.write('"');
    writer.write(escapeDoubleQuotes(data));
    writer.write('"');
}
 function printPresentations(model) {
    if(model == null) {
        return
    }
    var taggedValues = model.getTaggedValues()
    for each(var taggedValue in taggedValues) {
        print(taggedValue.getKey() + ":" + taggedValue.getValue())
    }
}

 function printTaggedValueInfo(model) {
    if(model == null) {
        return
    }
    var taggedValues = model.getTaggedValues()
    for each(var taggedValue in taggedValues) {
        print(taggedValue.getKey() + ":" + taggedValue.getValue())
    }
}
function escapeDoubleQuotes(data) {
    return data.replaceAll("\"", "\"\"");
}
