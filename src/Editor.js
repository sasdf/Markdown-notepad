/* global mermaidAPI */
var markdownIt = require('markdown-it')

function Editor(editorDOM, iframeDOM, templateURL){
    var _this = this
    this.editorDOM = editorDOM;
    this.iframeDOM = iframeDOM;
    this.iframeDOM.src = templateURL
    this.images = []
    window.onbeforeunload = function(){return "Leave?"}
    this.md = markdownIt({
        html: true,
        highlight: function (str, lang) {
            var esc = _this.md.utils.escapeHtml;
            
            try {
                if (lang && lang !== 'auto' && window.hljs.getLanguage(lang)) {
                
                    return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' +
                        window.hljs.highlight(lang, str, true).value +
                        '</code></pre>';
                
                } else {
                
                    var result = window.hljs.highlightAuto(str);
                    
                    return '<pre class="hljs language-' + esc(result.language) + '"><code>' +
                        result.value +
                        '</code></pre>';
                }
            } catch (__) {}
            
            return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
        }
    });
    this.md.use(require('markdown-it-katex'))
          // .use(require('markdown-it-attrs'))
           .use(require('./classElement.js'));
    
    (function(){
        var graphid = 0;
        var defaultRender = _this.md.renderer.rules.fence;
        var cache = []
        
        _this.md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        var token = tokens[idx];
        if(token.info === "graph") {
            var cacheMax = tokens.reduce((l, e)=>l+(e.info == 'graph'?1:0), 0) * 2
            var hash = Array.apply(null, {length: token.content.length})
                            .map(Number.call, Number)
                            .map(token.content.charCodeAt, token.content)
                            .reduce((l,e)=>(((l<<5)+e)+4294967296)%4294967296)
            for(var i=0;i<cache.length;++i){
                if(cache[i].hash === hash && cache[i].content.length === token.content.length && cache[i].content === token.content){
                    break;
                }
            }
            if(i < cache.length){
                var c = cache[i]
                if(i !== cache.length -1){
                    cache.splice(i, 1)
                    cache.push(c)
                }
                return c.result
            }else{
                var res = '';
                try{
                    mermaidAPI.render('mermaid_graph_'+(graphid++), token.content, function(s){
                        res = s
                    });
                }catch(e){}
                res = '<div>'+res.replace(/height="100%"/, '')+'</div>'
                cache.push({
                    hash: hash,
                    content: token.content,
                    result: res
                })
                if(cache.length > cacheMax) cache.shift()
                return res
            }
        }
        
        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
        };
    })()
    
    //
    // Inject line numbers for sync scroll. Notes:
    //
    // - We track only headings and paragraphs on first level. That's enough.
    // - Footnotes content causes jumps. Level limit filter it automatically.
    function injectLineNumbers(tokens, idx, options, env, slf) {
        var line;
        if (tokens[idx].map && tokens[idx].level === 0) {
            line = tokens[idx].map[0];
            tokens[idx].attrJoin('class', 'line');
            tokens[idx].attrSet('data-line', String(line));
        }
        return slf.renderToken(tokens, idx, options, env, slf);
    }
    
    this.md.renderer.rules.paragraph_open = this.md.renderer.rules.heading_open = injectLineNumbers;
    
    
    this.cmEditor = window.CodeMirror.fromTextArea(
        editorDOM,{
            theme: 'icecoder',
            lineNumbers: true,
            lineWrapping: true
        }
    );
    this.cmEditor.on('changes', this.renderPreview.bind(this));
    this.cmEditor.on('paste', function(ins, event){
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        //console.log(JSON.stringify(items)); // will give you the mime types
        for (var index in items) {
            var item = items[index];
            console.log(item);
            if (item.kind === 'file' && item.type.slice(0,5) === 'image') {
                event.preventDefault();
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event){
                    var idx = _this.images.push(event.target.result) -1
                    _this.outputImage.sheet.insertRule('.image-'+idx+"::after {content: url('"+event.target.result+"')}")
                    ins.replaceSelection('{{image-'+idx+'}}')
                };
                reader.readAsDataURL(blob);
            }
        }
    })
    this.output = undefined;
}
Editor.prototype.setOutput = function(html, image){
    this.output = html;
    this.outputImage = image
    this.renderPreview();
}
Editor.prototype.renderPreview = function(){
    var _this = this
    if(_this.output){
        var raw = _this.cmEditor.getValue()
            /*.replace(/(\n\s*){4,}/g, '\n\n<div class="newPage"></div>\n\n')*/
            
        var html = _this.md.render(raw)
        this.output.innerHTML = html
    }
}
Editor.prototype.print = function(){
    this.iframeDOM.contentWindow.print()
}
module.exports = Editor