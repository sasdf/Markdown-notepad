/* global __DEV__ */
if(__DEV__) require('./dev_html.js')
var Editor = require('./Editor.js')
var editor = window.editor = new Editor(document.getElementById('editor'), document.getElementById('output'), 'asset/template.html')
document.getElementById("printbtn").onclick = function(e){
    e.stopPropagation()
    e.preventDefault();
    editor.print();
    return false;
}