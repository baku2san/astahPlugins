
run();

exit;
function run() {
    exportClassesInCsv();
    return;
    displayActor();    // for test
    return;
}
function displayActor(){
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model)) {
        //classes = astah.findElements(IClass.class);
        
        classes = projectAccessor.findElements(IClass.class);
    }
    var hoge = ["","","","",""];
    hoge[3] = "hoge";
    print(hoge);
    for(var i in classes) {
        var clazz = classes[i];
        var clazzTypes = clazz.getStereotypes();    // StreotypeでActorを見分ける
        var isActor = false;
        for (var index in clazzTypes){
            if (clazzTypes[index] == "actor"){
                isActor = true;                
                break;
            }
        }
        if (isActor){   
            if (countDepth(clazz,0) == 0){
//                print(clazz);
                printSpecification(clazz, 0);
            }

            var attributes = clazz.getAttributes ();// 誘導可能性が決まっているもののみ見れる？
            if (attributes.length > 0){
            } else { // ユースケース持っていない場合にアクターのみ出力する
                
            }
        }
    }
}
function printSpecification(clazz, depth){
    var specializations = clazz.getSpecializations();
    if( countDepth(clazz, 0) == 0){
        print( clazz);
    }
    if (specializations.length > 0){
        for( var sIndex in specializations){
            var spec = specializations[sIndex];
            var subClass = spec.getSubType();
            var nextDepth = depth + 1;
            print(Array(nextDepth + 1).join('| ')+ subClass);
            printSpecification(subClass, nextDepth);
        }
    } else {
        return;
    }    
}
function countDepth(clazz, depth){
    var generalizations = clazz.getGeneralizations();
    if (generalizations.length > 0){
        return countDepth(generalizations[0].getSuperType(), depth + 1);
    } else {
        return depth;
    }
}

function exportClassesInCsv() {
    with(new JavaImporter(
            com.change_vision.jude.api.inf.model)) {
        //classes = astah.findElements(IClass.class);
        
        classes = projectAccessor.findElements(IClass.class);
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
 
        for(var i in classes) {
            var clazz = classes[i];
            var clazzTypes = clazz.getStereotypes();    // StreotypeでActorを見分ける
            var isActor = false;
            for (var index in clazzTypes){
                if (clazzTypes[index] == "actor"){
                    isActor = true;
                    
                    break;
                }
            }
            if (isActor){                   
                if (countDepth(clazz,0) == 0){ // 継承関係のTopから、順を追って表示
                    outputSpecification(writer, clazz, 0);
                }
            }
        } 
        writer.close();
    }
}
function outputLine(writer, clazz, depth){
    var actors = ["","","",""]; // 現状Actorの継承は　親＞子＞孫＞ひ孫　までなので。
    actors[depth] = clazz.getName();
    var attributes = clazz.getAttributes ();// 誘導可能性が決まっているもののみ見れる？

    if (attributes.length > 0){
        for(var i2 in attributes){
            var typeExpression = attributes[i2].getTypeExpression();
            var rowData = [];
            for ( var aIndex in actors){    // 階層化アクター出力
                rowData.push(actors[aIndex]);                
            }
            rowData.push(typeExpression);        
            writeRow(writer, rowData);
        }
    } else { // ユースケース持っていない場合にアクターのみ出力する
        var rowData = [];
        for ( var aIndex in actors){
            rowData.push(actors[aIndex]);          
        }
        rowData.push("");        
        writeRow(writer, rowData);
    }
}
function outputSpecification(writer, clazz, depth){
    var specializations = clazz.getSpecializations();
    if( countDepth(clazz, 0) == 0){
        outputLine( writer, clazz, depth);
    }
    if (specializations.length > 0){
        for( var sIndex in specializations){
            var spec = specializations[sIndex];
            var subClass = spec.getSubType();
            var nextDepth = depth + 1;
            outputLine( writer, subClass, depth + 1);
            outputSpecification(writer, subClass, nextDepth);
        }
    } else {
        return;
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
function escapeDoubleQuotes(data) {
    return data.replaceAll("\"", "\"\"");
}
