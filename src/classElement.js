// Process [[css]]

'use strict';
var ids = 0;
module.exports = function classElementPlugin(md, options) {
    function classElement(state, silent) {
        var content,
            labelEnd,
            labelStart,
            token,
            found,
            marker,
            curLevel,
            oldPos = state.pos,
            max = state.posMax,
            level = 2;
        
        if (state.src.charCodeAt(state.pos) !== 0x7B/* { */) { return false; }
        if (state.src.charCodeAt(state.pos + 1) !== 0x7B/* { */) { return false; }
        
        labelStart = state.pos + 2;
        state.pos = labelStart;
        
        curLevel = level;
        while (state.pos < max) {
            marker = state.src.charCodeAt(state.pos);
            if (marker === 0x7D /* } */) {
                --curLevel;
                if (curLevel === 0) {
                    found = true;
                    break;
                }
            }else{
                curLevel = level;
            }
            
            state.md.inline.skipToken(state);
        }
        
        if (!found) { state.pos = oldPos; return false; }
        
        labelEnd = state.pos -1;
        
        if (!silent) {
            content = state.src.slice(labelStart, labelEnd)
            
            /*state.md.inline.parse(
            content,
            state.md,
            state.env,
            tokens = []
            );*/
            
            token          = state.push('class_element', 'span', 0);
            token.children = [];
            token.content  = content;
        }
        
        state.pos++;
        state.posMax = max;
        return true;
    };
    
    function classElementRenderer(tokens, idx, options, env, slf) {
        var content, labels, label, scale;
        content = tokens[idx].content;
        labels = content.split('|', 2)
        label = md.utils.escapeHtml(labels[0])
        scale = parseFloat(labels[1])
        return '<span id="ce_'+(ids++)+'" class="'+label+'" '+slf.renderAttrs(tokens[idx])+'>'+((isFinite(scale))?'<style>#ce_'+(ids-1)+'::after{zoom:'+scale+';}</style>':'')+'</span>'
    }
    md.inline.ruler.push("class_element", classElement);
    md.renderer.rules.class_element = classElementRenderer
};