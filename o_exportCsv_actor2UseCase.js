
run();

exit;
function run() {
    exportClassesInCsv();
    return;
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
                var attributes = clazz.getAttributes ();// 誘導可能性が決まっているもののみ見れる？
                if (attributes.length > 0){
                    for(var i2 in attributes){
                        var typeExpression = attributes[i2].getTypeExpression();
                        var rowData = [];
                        rowData.push(clazz.getName());
                        rowData.push(typeExpression);        
                        writeRow(writer, rowData);
                    }
                } else { // ユースケース持っていない場合にアクターのみ出力する
                    var rowData = [];
                    rowData.push(clazz.getName());
                    rowData.push("");        
                    writeRow(writer, rowData);
                }
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
function escapeDoubleQuotes(data) {
    return data.replaceAll("\"", "\"\"");
}
