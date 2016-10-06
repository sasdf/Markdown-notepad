/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global __DEV__ */
	if(false) require('./dev_html.js')
	var Editor = __webpack_require__(1)
	var editor = window.editor = new Editor(document.getElementById('editor'), document.getElementById('output'), 'asset/template.html')
	document.getElementById("printbtn").onclick = function(e){
	    e.stopPropagation()
	    e.preventDefault();
	    editor.print();
	    return false;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var markdownIt = __webpack_require__(2)

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
	    this.md.use(__webpack_require__(70))
	          // .use(require('markdown-it-attrs'))
	           .use(__webpack_require__(94))
	    
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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	module.exports = __webpack_require__(3);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// Main parser class

	'use strict';


	var utils        = __webpack_require__(4);
	var helpers      = __webpack_require__(18);
	var Renderer     = __webpack_require__(22);
	var ParserCore   = __webpack_require__(23);
	var ParserBlock  = __webpack_require__(33);
	var ParserInline = __webpack_require__(48);
	var LinkifyIt    = __webpack_require__(63);
	var mdurl        = __webpack_require__(8);
	var punycode     = __webpack_require__(65);


	var config = {
	  'default': __webpack_require__(67),
	  zero: __webpack_require__(68),
	  commonmark: __webpack_require__(69)
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	// This validator can prohibit more than really needed to prevent XSS. It's a
	// tradeoff to keep code simple and to be secure by default.
	//
	// If you need different setup - override validator method as you wish. Or
	// replace it with dummy function and use external sanitizer.
	//

	var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
	var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

	function validateLink(url) {
	  // url should be normalized at this point, and existing entities are decoded
	  var str = url.trim().toLowerCase();

	  return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
	}

	////////////////////////////////////////////////////////////////////////////////


	var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

	function normalizeLink(url) {
	  var parsed = mdurl.parse(url, true);

	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toASCII(parsed.hostname);
	      } catch (er) { /**/ }
	    }
	  }

	  return mdurl.encode(mdurl.format(parsed));
	}

	function normalizeLinkText(url) {
	  var parsed = mdurl.parse(url, true);

	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toUnicode(parsed.hostname);
	      } catch (er) { /**/ }
	    }
	  }

	  return mdurl.decode(mdurl.format(parsed));
	}


	/**
	 * class MarkdownIt
	 *
	 * Main parser/renderer class.
	 *
	 * ##### Usage
	 *
	 * ```javascript
	 * // node.js, "classic" way:
	 * var MarkdownIt = require('markdown-it'),
	 *     md = new MarkdownIt();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // node.js, the same, but with sugar:
	 * var md = require('markdown-it')();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // browser without AMD, added to "window" on script load
	 * // Note, there are no dash.
	 * var md = window.markdownit();
	 * var result = md.render('# markdown-it rulezz!');
	 * ```
	 *
	 * Single line rendering, without paragraph wrap:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 * var result = md.renderInline('__markdown-it__ rulezz!');
	 * ```
	 **/

	/**
	 * new MarkdownIt([presetName, options])
	 * - presetName (String): optional, `commonmark` / `zero`
	 * - options (Object)
	 *
	 * Creates parser instanse with given config. Can be called without `new`.
	 *
	 * ##### presetName
	 *
	 * MarkdownIt provides named presets as a convenience to quickly
	 * enable/disable active syntax rules and options for common use cases.
	 *
	 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
	 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
	 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
	 *   similar to GFM, used when no preset name given. Enables all available rules,
	 *   but still without html, typographer & autolinker.
	 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
	 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
	 *   For example, when you need only `bold` and `italic` markup and nothing else.
	 *
	 * ##### options:
	 *
	 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
	 *   That's not safe! You may need external sanitizer to protect output from XSS.
	 *   It's better to extend features via plugins, instead of enabling HTML.
	 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
	 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
	 *   world you will need HTML output.
	 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
	 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
	 *   Can be useful for external highlighters.
	 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
	 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
	 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
	 *   quotes beautification (smartquotes).
	 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
	 *   pairs, when typographer enabled and smartquotes on. For example, you can
	 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
	 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
	 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
	 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
	 *   return empty string if the source was not changed and should be escaped
	 *   externaly. If result starts with <pre... internal wrapper is skipped.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * // commonmark mode
	 * var md = require('markdown-it')('commonmark');
	 *
	 * // default mode
	 * var md = require('markdown-it')();
	 *
	 * // enable everything
	 * var md = require('markdown-it')({
	 *   html: true,
	 *   linkify: true,
	 *   typographer: true
	 * });
	 * ```
	 *
	 * ##### Syntax highlighting
	 *
	 * ```js
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return hljs.highlight(lang, str, true).value;
	 *       } catch (__) {}
	 *     }
	 *
	 *     return ''; // use external default escaping
	 *   }
	 * });
	 * ```
	 *
	 * Or with full wrapper override (if you need assign class to `<pre>`):
	 *
	 * ```javascript
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * // Actual default values
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return '<pre class="hljs"><code>' +
	 *                hljs.highlight(lang, str, true).value +
	 *                '</code></pre>';
	 *       } catch (__) {}
	 *     }
	 *
	 *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
	 *   }
	 * });
	 * ```
	 *
	 **/
	function MarkdownIt(presetName, options) {
	  if (!(this instanceof MarkdownIt)) {
	    return new MarkdownIt(presetName, options);
	  }

	  if (!options) {
	    if (!utils.isString(presetName)) {
	      options = presetName || {};
	      presetName = 'default';
	    }
	  }

	  /**
	   * MarkdownIt#inline -> ParserInline
	   *
	   * Instance of [[ParserInline]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.inline = new ParserInline();

	  /**
	   * MarkdownIt#block -> ParserBlock
	   *
	   * Instance of [[ParserBlock]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.block = new ParserBlock();

	  /**
	   * MarkdownIt#core -> Core
	   *
	   * Instance of [[Core]] chain executor. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.core = new ParserCore();

	  /**
	   * MarkdownIt#renderer -> Renderer
	   *
	   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
	   * rules for new token types, generated by plugins.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * function myToken(tokens, idx, options, env, self) {
	   *   //...
	   *   return result;
	   * };
	   *
	   * md.renderer.rules['my_token'] = myToken
	   * ```
	   *
	   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
	   **/
	  this.renderer = new Renderer();

	  /**
	   * MarkdownIt#linkify -> LinkifyIt
	   *
	   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
	   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
	   * rule.
	   **/
	  this.linkify = new LinkifyIt();

	  /**
	   * MarkdownIt#validateLink(url) -> Boolean
	   *
	   * Link validation function. CommonMark allows too much in links. By default
	   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
	   * except some embedded image types.
	   *
	   * You can change this behaviour:
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   * // enable everything
	   * md.validateLink = function () { return true; }
	   * ```
	   **/
	  this.validateLink = validateLink;

	  /**
	   * MarkdownIt#normalizeLink(url) -> String
	   *
	   * Function used to encode link url to a machine-readable format,
	   * which includes url-encoding, punycode, etc.
	   **/
	  this.normalizeLink = normalizeLink;

	  /**
	   * MarkdownIt#normalizeLinkText(url) -> String
	   *
	   * Function used to decode link url to a human-readable format`
	   **/
	  this.normalizeLinkText = normalizeLinkText;


	  // Expose utils & helpers for easy acces from plugins

	  /**
	   * MarkdownIt#utils -> utils
	   *
	   * Assorted utility functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
	   **/
	  this.utils = utils;

	  /**
	   * MarkdownIt#helpers -> helpers
	   *
	   * Link components parser functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
	   **/
	  this.helpers = helpers;


	  this.options = {};
	  this.configure(presetName);

	  if (options) { this.set(options); }
	}


	/** chainable
	 * MarkdownIt.set(options)
	 *
	 * Set parser options (in the same format as in constructor). Probably, you
	 * will never need it, but you can change options after constructor call.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .set({ html: true, breaks: true })
	 *             .set({ typographer, true });
	 * ```
	 *
	 * __Note:__ To achieve the best possible performance, don't modify a
	 * `markdown-it` instance options on the fly. If you need multiple configurations
	 * it's best to create multiple instances and initialize each with separate
	 * config.
	 **/
	MarkdownIt.prototype.set = function (options) {
	  utils.assign(this.options, options);
	  return this;
	};


	/** chainable, internal
	 * MarkdownIt.configure(presets)
	 *
	 * Batch load of all options and compenent settings. This is internal method,
	 * and you probably will not need it. But if you with - see available presets
	 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
	 *
	 * We strongly recommend to use presets instead of direct config loads. That
	 * will give better compatibility with next versions.
	 **/
	MarkdownIt.prototype.configure = function (presets) {
	  var self = this, presetName;

	  if (utils.isString(presets)) {
	    presetName = presets;
	    presets = config[presetName];
	    if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
	  }

	  if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

	  if (presets.options) { self.set(presets.options); }

	  if (presets.components) {
	    Object.keys(presets.components).forEach(function (name) {
	      if (presets.components[name].rules) {
	        self[name].ruler.enableOnly(presets.components[name].rules);
	      }
	      if (presets.components[name].rules2) {
	        self[name].ruler2.enableOnly(presets.components[name].rules2);
	      }
	    });
	  }
	  return this;
	};


	/** chainable
	 * MarkdownIt.enable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to enable
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable list or rules. It will automatically find appropriate components,
	 * containing rules with given names. If rule not found, and `ignoreInvalid`
	 * not set - throws exception.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .enable(['sub', 'sup'])
	 *             .disable('smartquotes');
	 * ```
	 **/
	MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
	  var result = [];

	  if (!Array.isArray(list)) { list = [ list ]; }

	  [ 'core', 'block', 'inline' ].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.enable(list, true));
	  }, this);

	  result = result.concat(this.inline.ruler2.enable(list, true));

	  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
	  }

	  return this;
	};


	/** chainable
	 * MarkdownIt.disable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * The same as [[MarkdownIt.enable]], but turn specified rules off.
	 **/
	MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
	  var result = [];

	  if (!Array.isArray(list)) { list = [ list ]; }

	  [ 'core', 'block', 'inline' ].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.disable(list, true));
	  }, this);

	  result = result.concat(this.inline.ruler2.disable(list, true));

	  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
	  }
	  return this;
	};


	/** chainable
	 * MarkdownIt.use(plugin, params)
	 *
	 * Load specified plugin with given params into current parser instance.
	 * It's just a sugar to call `plugin(md, params)` with curring.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var iterator = require('markdown-it-for-inline');
	 * var md = require('markdown-it')()
	 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
	 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
	 *             });
	 * ```
	 **/
	MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
	  var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
	  plugin.apply(plugin, args);
	  return this;
	};


	/** internal
	 * MarkdownIt.parse(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Parse input string and returns list of block tokens (special token type
	 * "inline" will contain list of inline tokens). You should not call this
	 * method directly, until you write custom renderer (for example, to produce
	 * AST).
	 *
	 * `env` is used to pass data between "distributed" rules and return additional
	 * metadata like reference info, needed for the renderer. It also can be used to
	 * inject data in specific cases. Usually, you will be ok to pass `{}`,
	 * and then pass updated object to renderer.
	 **/
	MarkdownIt.prototype.parse = function (src, env) {
	  var state = new this.core.State(src, this, env);

	  this.core.process(state);

	  return state.tokens;
	};


	/**
	 * MarkdownIt.render(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Render markdown string into html. It does all magic for you :).
	 *
	 * `env` can be used to inject additional metadata (`{}` by default).
	 * But you will not need it with high probability. See also comment
	 * in [[MarkdownIt.parse]].
	 **/
	MarkdownIt.prototype.render = function (src, env) {
	  env = env || {};

	  return this.renderer.render(this.parse(src, env), this.options, env);
	};


	/** internal
	 * MarkdownIt.parseInline(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
	 * block tokens list with the single `inline` element, containing parsed inline
	 * tokens in `children` property. Also updates `env` object.
	 **/
	MarkdownIt.prototype.parseInline = function (src, env) {
	  var state = new this.core.State(src, this, env);

	  state.inlineMode = true;
	  this.core.process(state);

	  return state.tokens;
	};


	/**
	 * MarkdownIt.renderInline(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
	 * will NOT be wrapped into `<p>` tags.
	 **/
	MarkdownIt.prototype.renderInline = function (src, env) {
	  env = env || {};

	  return this.renderer.render(this.parseInline(src, env), this.options, env);
	};


	module.exports = MarkdownIt;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Utilities
	//
	'use strict';


	function _class(obj) { return Object.prototype.toString.call(obj); }

	function isString(obj) { return _class(obj) === '[object String]'; }

	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	function has(object, key) {
	  return _hasOwnProperty.call(object, key);
	}

	// Merge objects
	//
	function assign(obj /*from1, from2, from3, ...*/) {
	  var sources = Array.prototype.slice.call(arguments, 1);

	  sources.forEach(function (source) {
	    if (!source) { return; }

	    if (typeof source !== 'object') {
	      throw new TypeError(source + 'must be object');
	    }

	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });

	  return obj;
	}

	// Remove element from array and put another array at those position.
	// Useful for some operations with tokens
	function arrayReplaceAt(src, pos, newElements) {
	  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
	}

	////////////////////////////////////////////////////////////////////////////////

	function isValidEntityCode(c) {
	  /*eslint no-bitwise:0*/
	  // broken sequence
	  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
	  // never used
	  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
	  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
	  // control codes
	  if (c >= 0x00 && c <= 0x08) { return false; }
	  if (c === 0x0B) { return false; }
	  if (c >= 0x0E && c <= 0x1F) { return false; }
	  if (c >= 0x7F && c <= 0x9F) { return false; }
	  // out of range
	  if (c > 0x10FFFF) { return false; }
	  return true;
	}

	function fromCodePoint(c) {
	  /*eslint no-bitwise:0*/
	  if (c > 0xffff) {
	    c -= 0x10000;
	    var surrogate1 = 0xd800 + (c >> 10),
	        surrogate2 = 0xdc00 + (c & 0x3ff);

	    return String.fromCharCode(surrogate1, surrogate2);
	  }
	  return String.fromCharCode(c);
	}


	var UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
	var ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
	var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

	var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

	var entities = __webpack_require__(5);

	function replaceEntityPattern(match, name) {
	  var code = 0;

	  if (has(entities, name)) {
	    return entities[name];
	  }

	  if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
	    code = name[1].toLowerCase() === 'x' ?
	      parseInt(name.slice(2), 16)
	    :
	      parseInt(name.slice(1), 10);
	    if (isValidEntityCode(code)) {
	      return fromCodePoint(code);
	    }
	  }

	  return match;
	}

	/*function replaceEntities(str) {
	  if (str.indexOf('&') < 0) { return str; }

	  return str.replace(ENTITY_RE, replaceEntityPattern);
	}*/

	function unescapeMd(str) {
	  if (str.indexOf('\\') < 0) { return str; }
	  return str.replace(UNESCAPE_MD_RE, '$1');
	}

	function unescapeAll(str) {
	  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

	  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
	    if (escaped) { return escaped; }
	    return replaceEntityPattern(match, entity);
	  });
	}

	////////////////////////////////////////////////////////////////////////////////

	var HTML_ESCAPE_TEST_RE = /[&<>"]/;
	var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
	var HTML_REPLACEMENTS = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};

	function replaceUnsafeChar(ch) {
	  return HTML_REPLACEMENTS[ch];
	}

	function escapeHtml(str) {
	  if (HTML_ESCAPE_TEST_RE.test(str)) {
	    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	  }
	  return str;
	}

	////////////////////////////////////////////////////////////////////////////////

	var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

	function escapeRE(str) {
	  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
	}

	////////////////////////////////////////////////////////////////////////////////

	function isSpace(code) {
	  switch (code) {
	    case 0x09:
	    case 0x20:
	      return true;
	  }
	  return false;
	}

	// Zs (unicode class) || [\t\f\v\r\n]
	function isWhiteSpace(code) {
	  if (code >= 0x2000 && code <= 0x200A) { return true; }
	  switch (code) {
	    case 0x09: // \t
	    case 0x0A: // \n
	    case 0x0B: // \v
	    case 0x0C: // \f
	    case 0x0D: // \r
	    case 0x20:
	    case 0xA0:
	    case 0x1680:
	    case 0x202F:
	    case 0x205F:
	    case 0x3000:
	      return true;
	  }
	  return false;
	}

	////////////////////////////////////////////////////////////////////////////////

	/*eslint-disable max-len*/
	var UNICODE_PUNCT_RE = __webpack_require__(7);

	// Currently without astral characters support.
	function isPunctChar(ch) {
	  return UNICODE_PUNCT_RE.test(ch);
	}


	// Markdown ASCII punctuation characters.
	//
	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character
	//
	// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
	//
	function isMdAsciiPunct(ch) {
	  switch (ch) {
	    case 0x21/* ! */:
	    case 0x22/* " */:
	    case 0x23/* # */:
	    case 0x24/* $ */:
	    case 0x25/* % */:
	    case 0x26/* & */:
	    case 0x27/* ' */:
	    case 0x28/* ( */:
	    case 0x29/* ) */:
	    case 0x2A/* * */:
	    case 0x2B/* + */:
	    case 0x2C/* , */:
	    case 0x2D/* - */:
	    case 0x2E/* . */:
	    case 0x2F/* / */:
	    case 0x3A/* : */:
	    case 0x3B/* ; */:
	    case 0x3C/* < */:
	    case 0x3D/* = */:
	    case 0x3E/* > */:
	    case 0x3F/* ? */:
	    case 0x40/* @ */:
	    case 0x5B/* [ */:
	    case 0x5C/* \ */:
	    case 0x5D/* ] */:
	    case 0x5E/* ^ */:
	    case 0x5F/* _ */:
	    case 0x60/* ` */:
	    case 0x7B/* { */:
	    case 0x7C/* | */:
	    case 0x7D/* } */:
	    case 0x7E/* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}

	// Hepler to unify [reference labels].
	//
	function normalizeReference(str) {
	  // use .toUpperCase() instead of .toLowerCase()
	  // here to avoid a conflict with Object.prototype
	  // members (most notably, `__proto__`)
	  return str.trim().replace(/\s+/g, ' ').toUpperCase();
	}

	////////////////////////////////////////////////////////////////////////////////

	// Re-export libraries commonly used in both markdown-it and its plugins,
	// so plugins won't have to depend on them explicitly, which reduces their
	// bundled size (e.g. a browser build).
	//
	exports.lib                 = {};
	exports.lib.mdurl           = __webpack_require__(8);
	exports.lib.ucmicro         = __webpack_require__(13);

	exports.assign              = assign;
	exports.isString            = isString;
	exports.has                 = has;
	exports.unescapeMd          = unescapeMd;
	exports.unescapeAll         = unescapeAll;
	exports.isValidEntityCode   = isValidEntityCode;
	exports.fromCodePoint       = fromCodePoint;
	// exports.replaceEntities     = replaceEntities;
	exports.escapeHtml          = escapeHtml;
	exports.arrayReplaceAt      = arrayReplaceAt;
	exports.isSpace             = isSpace;
	exports.isWhiteSpace        = isWhiteSpace;
	exports.isMdAsciiPunct      = isMdAsciiPunct;
	exports.isPunctChar         = isPunctChar;
	exports.escapeRE            = escapeRE;
	exports.normalizeReference  = normalizeReference;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// HTML5 entities map: { name -> utf16string }
	//
	'use strict';

	/*eslint quotes:0*/
	module.exports = __webpack_require__(6);


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
		"Aacute": "Á",
		"aacute": "á",
		"Abreve": "Ă",
		"abreve": "ă",
		"ac": "∾",
		"acd": "∿",
		"acE": "∾̳",
		"Acirc": "Â",
		"acirc": "â",
		"acute": "´",
		"Acy": "А",
		"acy": "а",
		"AElig": "Æ",
		"aelig": "æ",
		"af": "⁡",
		"Afr": "𝔄",
		"afr": "𝔞",
		"Agrave": "À",
		"agrave": "à",
		"alefsym": "ℵ",
		"aleph": "ℵ",
		"Alpha": "Α",
		"alpha": "α",
		"Amacr": "Ā",
		"amacr": "ā",
		"amalg": "⨿",
		"amp": "&",
		"AMP": "&",
		"andand": "⩕",
		"And": "⩓",
		"and": "∧",
		"andd": "⩜",
		"andslope": "⩘",
		"andv": "⩚",
		"ang": "∠",
		"ange": "⦤",
		"angle": "∠",
		"angmsdaa": "⦨",
		"angmsdab": "⦩",
		"angmsdac": "⦪",
		"angmsdad": "⦫",
		"angmsdae": "⦬",
		"angmsdaf": "⦭",
		"angmsdag": "⦮",
		"angmsdah": "⦯",
		"angmsd": "∡",
		"angrt": "∟",
		"angrtvb": "⊾",
		"angrtvbd": "⦝",
		"angsph": "∢",
		"angst": "Å",
		"angzarr": "⍼",
		"Aogon": "Ą",
		"aogon": "ą",
		"Aopf": "𝔸",
		"aopf": "𝕒",
		"apacir": "⩯",
		"ap": "≈",
		"apE": "⩰",
		"ape": "≊",
		"apid": "≋",
		"apos": "'",
		"ApplyFunction": "⁡",
		"approx": "≈",
		"approxeq": "≊",
		"Aring": "Å",
		"aring": "å",
		"Ascr": "𝒜",
		"ascr": "𝒶",
		"Assign": "≔",
		"ast": "*",
		"asymp": "≈",
		"asympeq": "≍",
		"Atilde": "Ã",
		"atilde": "ã",
		"Auml": "Ä",
		"auml": "ä",
		"awconint": "∳",
		"awint": "⨑",
		"backcong": "≌",
		"backepsilon": "϶",
		"backprime": "‵",
		"backsim": "∽",
		"backsimeq": "⋍",
		"Backslash": "∖",
		"Barv": "⫧",
		"barvee": "⊽",
		"barwed": "⌅",
		"Barwed": "⌆",
		"barwedge": "⌅",
		"bbrk": "⎵",
		"bbrktbrk": "⎶",
		"bcong": "≌",
		"Bcy": "Б",
		"bcy": "б",
		"bdquo": "„",
		"becaus": "∵",
		"because": "∵",
		"Because": "∵",
		"bemptyv": "⦰",
		"bepsi": "϶",
		"bernou": "ℬ",
		"Bernoullis": "ℬ",
		"Beta": "Β",
		"beta": "β",
		"beth": "ℶ",
		"between": "≬",
		"Bfr": "𝔅",
		"bfr": "𝔟",
		"bigcap": "⋂",
		"bigcirc": "◯",
		"bigcup": "⋃",
		"bigodot": "⨀",
		"bigoplus": "⨁",
		"bigotimes": "⨂",
		"bigsqcup": "⨆",
		"bigstar": "★",
		"bigtriangledown": "▽",
		"bigtriangleup": "△",
		"biguplus": "⨄",
		"bigvee": "⋁",
		"bigwedge": "⋀",
		"bkarow": "⤍",
		"blacklozenge": "⧫",
		"blacksquare": "▪",
		"blacktriangle": "▴",
		"blacktriangledown": "▾",
		"blacktriangleleft": "◂",
		"blacktriangleright": "▸",
		"blank": "␣",
		"blk12": "▒",
		"blk14": "░",
		"blk34": "▓",
		"block": "█",
		"bne": "=⃥",
		"bnequiv": "≡⃥",
		"bNot": "⫭",
		"bnot": "⌐",
		"Bopf": "𝔹",
		"bopf": "𝕓",
		"bot": "⊥",
		"bottom": "⊥",
		"bowtie": "⋈",
		"boxbox": "⧉",
		"boxdl": "┐",
		"boxdL": "╕",
		"boxDl": "╖",
		"boxDL": "╗",
		"boxdr": "┌",
		"boxdR": "╒",
		"boxDr": "╓",
		"boxDR": "╔",
		"boxh": "─",
		"boxH": "═",
		"boxhd": "┬",
		"boxHd": "╤",
		"boxhD": "╥",
		"boxHD": "╦",
		"boxhu": "┴",
		"boxHu": "╧",
		"boxhU": "╨",
		"boxHU": "╩",
		"boxminus": "⊟",
		"boxplus": "⊞",
		"boxtimes": "⊠",
		"boxul": "┘",
		"boxuL": "╛",
		"boxUl": "╜",
		"boxUL": "╝",
		"boxur": "└",
		"boxuR": "╘",
		"boxUr": "╙",
		"boxUR": "╚",
		"boxv": "│",
		"boxV": "║",
		"boxvh": "┼",
		"boxvH": "╪",
		"boxVh": "╫",
		"boxVH": "╬",
		"boxvl": "┤",
		"boxvL": "╡",
		"boxVl": "╢",
		"boxVL": "╣",
		"boxvr": "├",
		"boxvR": "╞",
		"boxVr": "╟",
		"boxVR": "╠",
		"bprime": "‵",
		"breve": "˘",
		"Breve": "˘",
		"brvbar": "¦",
		"bscr": "𝒷",
		"Bscr": "ℬ",
		"bsemi": "⁏",
		"bsim": "∽",
		"bsime": "⋍",
		"bsolb": "⧅",
		"bsol": "\\",
		"bsolhsub": "⟈",
		"bull": "•",
		"bullet": "•",
		"bump": "≎",
		"bumpE": "⪮",
		"bumpe": "≏",
		"Bumpeq": "≎",
		"bumpeq": "≏",
		"Cacute": "Ć",
		"cacute": "ć",
		"capand": "⩄",
		"capbrcup": "⩉",
		"capcap": "⩋",
		"cap": "∩",
		"Cap": "⋒",
		"capcup": "⩇",
		"capdot": "⩀",
		"CapitalDifferentialD": "ⅅ",
		"caps": "∩︀",
		"caret": "⁁",
		"caron": "ˇ",
		"Cayleys": "ℭ",
		"ccaps": "⩍",
		"Ccaron": "Č",
		"ccaron": "č",
		"Ccedil": "Ç",
		"ccedil": "ç",
		"Ccirc": "Ĉ",
		"ccirc": "ĉ",
		"Cconint": "∰",
		"ccups": "⩌",
		"ccupssm": "⩐",
		"Cdot": "Ċ",
		"cdot": "ċ",
		"cedil": "¸",
		"Cedilla": "¸",
		"cemptyv": "⦲",
		"cent": "¢",
		"centerdot": "·",
		"CenterDot": "·",
		"cfr": "𝔠",
		"Cfr": "ℭ",
		"CHcy": "Ч",
		"chcy": "ч",
		"check": "✓",
		"checkmark": "✓",
		"Chi": "Χ",
		"chi": "χ",
		"circ": "ˆ",
		"circeq": "≗",
		"circlearrowleft": "↺",
		"circlearrowright": "↻",
		"circledast": "⊛",
		"circledcirc": "⊚",
		"circleddash": "⊝",
		"CircleDot": "⊙",
		"circledR": "®",
		"circledS": "Ⓢ",
		"CircleMinus": "⊖",
		"CirclePlus": "⊕",
		"CircleTimes": "⊗",
		"cir": "○",
		"cirE": "⧃",
		"cire": "≗",
		"cirfnint": "⨐",
		"cirmid": "⫯",
		"cirscir": "⧂",
		"ClockwiseContourIntegral": "∲",
		"CloseCurlyDoubleQuote": "”",
		"CloseCurlyQuote": "’",
		"clubs": "♣",
		"clubsuit": "♣",
		"colon": ":",
		"Colon": "∷",
		"Colone": "⩴",
		"colone": "≔",
		"coloneq": "≔",
		"comma": ",",
		"commat": "@",
		"comp": "∁",
		"compfn": "∘",
		"complement": "∁",
		"complexes": "ℂ",
		"cong": "≅",
		"congdot": "⩭",
		"Congruent": "≡",
		"conint": "∮",
		"Conint": "∯",
		"ContourIntegral": "∮",
		"copf": "𝕔",
		"Copf": "ℂ",
		"coprod": "∐",
		"Coproduct": "∐",
		"copy": "©",
		"COPY": "©",
		"copysr": "℗",
		"CounterClockwiseContourIntegral": "∳",
		"crarr": "↵",
		"cross": "✗",
		"Cross": "⨯",
		"Cscr": "𝒞",
		"cscr": "𝒸",
		"csub": "⫏",
		"csube": "⫑",
		"csup": "⫐",
		"csupe": "⫒",
		"ctdot": "⋯",
		"cudarrl": "⤸",
		"cudarrr": "⤵",
		"cuepr": "⋞",
		"cuesc": "⋟",
		"cularr": "↶",
		"cularrp": "⤽",
		"cupbrcap": "⩈",
		"cupcap": "⩆",
		"CupCap": "≍",
		"cup": "∪",
		"Cup": "⋓",
		"cupcup": "⩊",
		"cupdot": "⊍",
		"cupor": "⩅",
		"cups": "∪︀",
		"curarr": "↷",
		"curarrm": "⤼",
		"curlyeqprec": "⋞",
		"curlyeqsucc": "⋟",
		"curlyvee": "⋎",
		"curlywedge": "⋏",
		"curren": "¤",
		"curvearrowleft": "↶",
		"curvearrowright": "↷",
		"cuvee": "⋎",
		"cuwed": "⋏",
		"cwconint": "∲",
		"cwint": "∱",
		"cylcty": "⌭",
		"dagger": "†",
		"Dagger": "‡",
		"daleth": "ℸ",
		"darr": "↓",
		"Darr": "↡",
		"dArr": "⇓",
		"dash": "‐",
		"Dashv": "⫤",
		"dashv": "⊣",
		"dbkarow": "⤏",
		"dblac": "˝",
		"Dcaron": "Ď",
		"dcaron": "ď",
		"Dcy": "Д",
		"dcy": "д",
		"ddagger": "‡",
		"ddarr": "⇊",
		"DD": "ⅅ",
		"dd": "ⅆ",
		"DDotrahd": "⤑",
		"ddotseq": "⩷",
		"deg": "°",
		"Del": "∇",
		"Delta": "Δ",
		"delta": "δ",
		"demptyv": "⦱",
		"dfisht": "⥿",
		"Dfr": "𝔇",
		"dfr": "𝔡",
		"dHar": "⥥",
		"dharl": "⇃",
		"dharr": "⇂",
		"DiacriticalAcute": "´",
		"DiacriticalDot": "˙",
		"DiacriticalDoubleAcute": "˝",
		"DiacriticalGrave": "`",
		"DiacriticalTilde": "˜",
		"diam": "⋄",
		"diamond": "⋄",
		"Diamond": "⋄",
		"diamondsuit": "♦",
		"diams": "♦",
		"die": "¨",
		"DifferentialD": "ⅆ",
		"digamma": "ϝ",
		"disin": "⋲",
		"div": "÷",
		"divide": "÷",
		"divideontimes": "⋇",
		"divonx": "⋇",
		"DJcy": "Ђ",
		"djcy": "ђ",
		"dlcorn": "⌞",
		"dlcrop": "⌍",
		"dollar": "$",
		"Dopf": "𝔻",
		"dopf": "𝕕",
		"Dot": "¨",
		"dot": "˙",
		"DotDot": "⃜",
		"doteq": "≐",
		"doteqdot": "≑",
		"DotEqual": "≐",
		"dotminus": "∸",
		"dotplus": "∔",
		"dotsquare": "⊡",
		"doublebarwedge": "⌆",
		"DoubleContourIntegral": "∯",
		"DoubleDot": "¨",
		"DoubleDownArrow": "⇓",
		"DoubleLeftArrow": "⇐",
		"DoubleLeftRightArrow": "⇔",
		"DoubleLeftTee": "⫤",
		"DoubleLongLeftArrow": "⟸",
		"DoubleLongLeftRightArrow": "⟺",
		"DoubleLongRightArrow": "⟹",
		"DoubleRightArrow": "⇒",
		"DoubleRightTee": "⊨",
		"DoubleUpArrow": "⇑",
		"DoubleUpDownArrow": "⇕",
		"DoubleVerticalBar": "∥",
		"DownArrowBar": "⤓",
		"downarrow": "↓",
		"DownArrow": "↓",
		"Downarrow": "⇓",
		"DownArrowUpArrow": "⇵",
		"DownBreve": "̑",
		"downdownarrows": "⇊",
		"downharpoonleft": "⇃",
		"downharpoonright": "⇂",
		"DownLeftRightVector": "⥐",
		"DownLeftTeeVector": "⥞",
		"DownLeftVectorBar": "⥖",
		"DownLeftVector": "↽",
		"DownRightTeeVector": "⥟",
		"DownRightVectorBar": "⥗",
		"DownRightVector": "⇁",
		"DownTeeArrow": "↧",
		"DownTee": "⊤",
		"drbkarow": "⤐",
		"drcorn": "⌟",
		"drcrop": "⌌",
		"Dscr": "𝒟",
		"dscr": "𝒹",
		"DScy": "Ѕ",
		"dscy": "ѕ",
		"dsol": "⧶",
		"Dstrok": "Đ",
		"dstrok": "đ",
		"dtdot": "⋱",
		"dtri": "▿",
		"dtrif": "▾",
		"duarr": "⇵",
		"duhar": "⥯",
		"dwangle": "⦦",
		"DZcy": "Џ",
		"dzcy": "џ",
		"dzigrarr": "⟿",
		"Eacute": "É",
		"eacute": "é",
		"easter": "⩮",
		"Ecaron": "Ě",
		"ecaron": "ě",
		"Ecirc": "Ê",
		"ecirc": "ê",
		"ecir": "≖",
		"ecolon": "≕",
		"Ecy": "Э",
		"ecy": "э",
		"eDDot": "⩷",
		"Edot": "Ė",
		"edot": "ė",
		"eDot": "≑",
		"ee": "ⅇ",
		"efDot": "≒",
		"Efr": "𝔈",
		"efr": "𝔢",
		"eg": "⪚",
		"Egrave": "È",
		"egrave": "è",
		"egs": "⪖",
		"egsdot": "⪘",
		"el": "⪙",
		"Element": "∈",
		"elinters": "⏧",
		"ell": "ℓ",
		"els": "⪕",
		"elsdot": "⪗",
		"Emacr": "Ē",
		"emacr": "ē",
		"empty": "∅",
		"emptyset": "∅",
		"EmptySmallSquare": "◻",
		"emptyv": "∅",
		"EmptyVerySmallSquare": "▫",
		"emsp13": " ",
		"emsp14": " ",
		"emsp": " ",
		"ENG": "Ŋ",
		"eng": "ŋ",
		"ensp": " ",
		"Eogon": "Ę",
		"eogon": "ę",
		"Eopf": "𝔼",
		"eopf": "𝕖",
		"epar": "⋕",
		"eparsl": "⧣",
		"eplus": "⩱",
		"epsi": "ε",
		"Epsilon": "Ε",
		"epsilon": "ε",
		"epsiv": "ϵ",
		"eqcirc": "≖",
		"eqcolon": "≕",
		"eqsim": "≂",
		"eqslantgtr": "⪖",
		"eqslantless": "⪕",
		"Equal": "⩵",
		"equals": "=",
		"EqualTilde": "≂",
		"equest": "≟",
		"Equilibrium": "⇌",
		"equiv": "≡",
		"equivDD": "⩸",
		"eqvparsl": "⧥",
		"erarr": "⥱",
		"erDot": "≓",
		"escr": "ℯ",
		"Escr": "ℰ",
		"esdot": "≐",
		"Esim": "⩳",
		"esim": "≂",
		"Eta": "Η",
		"eta": "η",
		"ETH": "Ð",
		"eth": "ð",
		"Euml": "Ë",
		"euml": "ë",
		"euro": "€",
		"excl": "!",
		"exist": "∃",
		"Exists": "∃",
		"expectation": "ℰ",
		"exponentiale": "ⅇ",
		"ExponentialE": "ⅇ",
		"fallingdotseq": "≒",
		"Fcy": "Ф",
		"fcy": "ф",
		"female": "♀",
		"ffilig": "ﬃ",
		"fflig": "ﬀ",
		"ffllig": "ﬄ",
		"Ffr": "𝔉",
		"ffr": "𝔣",
		"filig": "ﬁ",
		"FilledSmallSquare": "◼",
		"FilledVerySmallSquare": "▪",
		"fjlig": "fj",
		"flat": "♭",
		"fllig": "ﬂ",
		"fltns": "▱",
		"fnof": "ƒ",
		"Fopf": "𝔽",
		"fopf": "𝕗",
		"forall": "∀",
		"ForAll": "∀",
		"fork": "⋔",
		"forkv": "⫙",
		"Fouriertrf": "ℱ",
		"fpartint": "⨍",
		"frac12": "½",
		"frac13": "⅓",
		"frac14": "¼",
		"frac15": "⅕",
		"frac16": "⅙",
		"frac18": "⅛",
		"frac23": "⅔",
		"frac25": "⅖",
		"frac34": "¾",
		"frac35": "⅗",
		"frac38": "⅜",
		"frac45": "⅘",
		"frac56": "⅚",
		"frac58": "⅝",
		"frac78": "⅞",
		"frasl": "⁄",
		"frown": "⌢",
		"fscr": "𝒻",
		"Fscr": "ℱ",
		"gacute": "ǵ",
		"Gamma": "Γ",
		"gamma": "γ",
		"Gammad": "Ϝ",
		"gammad": "ϝ",
		"gap": "⪆",
		"Gbreve": "Ğ",
		"gbreve": "ğ",
		"Gcedil": "Ģ",
		"Gcirc": "Ĝ",
		"gcirc": "ĝ",
		"Gcy": "Г",
		"gcy": "г",
		"Gdot": "Ġ",
		"gdot": "ġ",
		"ge": "≥",
		"gE": "≧",
		"gEl": "⪌",
		"gel": "⋛",
		"geq": "≥",
		"geqq": "≧",
		"geqslant": "⩾",
		"gescc": "⪩",
		"ges": "⩾",
		"gesdot": "⪀",
		"gesdoto": "⪂",
		"gesdotol": "⪄",
		"gesl": "⋛︀",
		"gesles": "⪔",
		"Gfr": "𝔊",
		"gfr": "𝔤",
		"gg": "≫",
		"Gg": "⋙",
		"ggg": "⋙",
		"gimel": "ℷ",
		"GJcy": "Ѓ",
		"gjcy": "ѓ",
		"gla": "⪥",
		"gl": "≷",
		"glE": "⪒",
		"glj": "⪤",
		"gnap": "⪊",
		"gnapprox": "⪊",
		"gne": "⪈",
		"gnE": "≩",
		"gneq": "⪈",
		"gneqq": "≩",
		"gnsim": "⋧",
		"Gopf": "𝔾",
		"gopf": "𝕘",
		"grave": "`",
		"GreaterEqual": "≥",
		"GreaterEqualLess": "⋛",
		"GreaterFullEqual": "≧",
		"GreaterGreater": "⪢",
		"GreaterLess": "≷",
		"GreaterSlantEqual": "⩾",
		"GreaterTilde": "≳",
		"Gscr": "𝒢",
		"gscr": "ℊ",
		"gsim": "≳",
		"gsime": "⪎",
		"gsiml": "⪐",
		"gtcc": "⪧",
		"gtcir": "⩺",
		"gt": ">",
		"GT": ">",
		"Gt": "≫",
		"gtdot": "⋗",
		"gtlPar": "⦕",
		"gtquest": "⩼",
		"gtrapprox": "⪆",
		"gtrarr": "⥸",
		"gtrdot": "⋗",
		"gtreqless": "⋛",
		"gtreqqless": "⪌",
		"gtrless": "≷",
		"gtrsim": "≳",
		"gvertneqq": "≩︀",
		"gvnE": "≩︀",
		"Hacek": "ˇ",
		"hairsp": " ",
		"half": "½",
		"hamilt": "ℋ",
		"HARDcy": "Ъ",
		"hardcy": "ъ",
		"harrcir": "⥈",
		"harr": "↔",
		"hArr": "⇔",
		"harrw": "↭",
		"Hat": "^",
		"hbar": "ℏ",
		"Hcirc": "Ĥ",
		"hcirc": "ĥ",
		"hearts": "♥",
		"heartsuit": "♥",
		"hellip": "…",
		"hercon": "⊹",
		"hfr": "𝔥",
		"Hfr": "ℌ",
		"HilbertSpace": "ℋ",
		"hksearow": "⤥",
		"hkswarow": "⤦",
		"hoarr": "⇿",
		"homtht": "∻",
		"hookleftarrow": "↩",
		"hookrightarrow": "↪",
		"hopf": "𝕙",
		"Hopf": "ℍ",
		"horbar": "―",
		"HorizontalLine": "─",
		"hscr": "𝒽",
		"Hscr": "ℋ",
		"hslash": "ℏ",
		"Hstrok": "Ħ",
		"hstrok": "ħ",
		"HumpDownHump": "≎",
		"HumpEqual": "≏",
		"hybull": "⁃",
		"hyphen": "‐",
		"Iacute": "Í",
		"iacute": "í",
		"ic": "⁣",
		"Icirc": "Î",
		"icirc": "î",
		"Icy": "И",
		"icy": "и",
		"Idot": "İ",
		"IEcy": "Е",
		"iecy": "е",
		"iexcl": "¡",
		"iff": "⇔",
		"ifr": "𝔦",
		"Ifr": "ℑ",
		"Igrave": "Ì",
		"igrave": "ì",
		"ii": "ⅈ",
		"iiiint": "⨌",
		"iiint": "∭",
		"iinfin": "⧜",
		"iiota": "℩",
		"IJlig": "Ĳ",
		"ijlig": "ĳ",
		"Imacr": "Ī",
		"imacr": "ī",
		"image": "ℑ",
		"ImaginaryI": "ⅈ",
		"imagline": "ℐ",
		"imagpart": "ℑ",
		"imath": "ı",
		"Im": "ℑ",
		"imof": "⊷",
		"imped": "Ƶ",
		"Implies": "⇒",
		"incare": "℅",
		"in": "∈",
		"infin": "∞",
		"infintie": "⧝",
		"inodot": "ı",
		"intcal": "⊺",
		"int": "∫",
		"Int": "∬",
		"integers": "ℤ",
		"Integral": "∫",
		"intercal": "⊺",
		"Intersection": "⋂",
		"intlarhk": "⨗",
		"intprod": "⨼",
		"InvisibleComma": "⁣",
		"InvisibleTimes": "⁢",
		"IOcy": "Ё",
		"iocy": "ё",
		"Iogon": "Į",
		"iogon": "į",
		"Iopf": "𝕀",
		"iopf": "𝕚",
		"Iota": "Ι",
		"iota": "ι",
		"iprod": "⨼",
		"iquest": "¿",
		"iscr": "𝒾",
		"Iscr": "ℐ",
		"isin": "∈",
		"isindot": "⋵",
		"isinE": "⋹",
		"isins": "⋴",
		"isinsv": "⋳",
		"isinv": "∈",
		"it": "⁢",
		"Itilde": "Ĩ",
		"itilde": "ĩ",
		"Iukcy": "І",
		"iukcy": "і",
		"Iuml": "Ï",
		"iuml": "ï",
		"Jcirc": "Ĵ",
		"jcirc": "ĵ",
		"Jcy": "Й",
		"jcy": "й",
		"Jfr": "𝔍",
		"jfr": "𝔧",
		"jmath": "ȷ",
		"Jopf": "𝕁",
		"jopf": "𝕛",
		"Jscr": "𝒥",
		"jscr": "𝒿",
		"Jsercy": "Ј",
		"jsercy": "ј",
		"Jukcy": "Є",
		"jukcy": "є",
		"Kappa": "Κ",
		"kappa": "κ",
		"kappav": "ϰ",
		"Kcedil": "Ķ",
		"kcedil": "ķ",
		"Kcy": "К",
		"kcy": "к",
		"Kfr": "𝔎",
		"kfr": "𝔨",
		"kgreen": "ĸ",
		"KHcy": "Х",
		"khcy": "х",
		"KJcy": "Ќ",
		"kjcy": "ќ",
		"Kopf": "𝕂",
		"kopf": "𝕜",
		"Kscr": "𝒦",
		"kscr": "𝓀",
		"lAarr": "⇚",
		"Lacute": "Ĺ",
		"lacute": "ĺ",
		"laemptyv": "⦴",
		"lagran": "ℒ",
		"Lambda": "Λ",
		"lambda": "λ",
		"lang": "⟨",
		"Lang": "⟪",
		"langd": "⦑",
		"langle": "⟨",
		"lap": "⪅",
		"Laplacetrf": "ℒ",
		"laquo": "«",
		"larrb": "⇤",
		"larrbfs": "⤟",
		"larr": "←",
		"Larr": "↞",
		"lArr": "⇐",
		"larrfs": "⤝",
		"larrhk": "↩",
		"larrlp": "↫",
		"larrpl": "⤹",
		"larrsim": "⥳",
		"larrtl": "↢",
		"latail": "⤙",
		"lAtail": "⤛",
		"lat": "⪫",
		"late": "⪭",
		"lates": "⪭︀",
		"lbarr": "⤌",
		"lBarr": "⤎",
		"lbbrk": "❲",
		"lbrace": "{",
		"lbrack": "[",
		"lbrke": "⦋",
		"lbrksld": "⦏",
		"lbrkslu": "⦍",
		"Lcaron": "Ľ",
		"lcaron": "ľ",
		"Lcedil": "Ļ",
		"lcedil": "ļ",
		"lceil": "⌈",
		"lcub": "{",
		"Lcy": "Л",
		"lcy": "л",
		"ldca": "⤶",
		"ldquo": "“",
		"ldquor": "„",
		"ldrdhar": "⥧",
		"ldrushar": "⥋",
		"ldsh": "↲",
		"le": "≤",
		"lE": "≦",
		"LeftAngleBracket": "⟨",
		"LeftArrowBar": "⇤",
		"leftarrow": "←",
		"LeftArrow": "←",
		"Leftarrow": "⇐",
		"LeftArrowRightArrow": "⇆",
		"leftarrowtail": "↢",
		"LeftCeiling": "⌈",
		"LeftDoubleBracket": "⟦",
		"LeftDownTeeVector": "⥡",
		"LeftDownVectorBar": "⥙",
		"LeftDownVector": "⇃",
		"LeftFloor": "⌊",
		"leftharpoondown": "↽",
		"leftharpoonup": "↼",
		"leftleftarrows": "⇇",
		"leftrightarrow": "↔",
		"LeftRightArrow": "↔",
		"Leftrightarrow": "⇔",
		"leftrightarrows": "⇆",
		"leftrightharpoons": "⇋",
		"leftrightsquigarrow": "↭",
		"LeftRightVector": "⥎",
		"LeftTeeArrow": "↤",
		"LeftTee": "⊣",
		"LeftTeeVector": "⥚",
		"leftthreetimes": "⋋",
		"LeftTriangleBar": "⧏",
		"LeftTriangle": "⊲",
		"LeftTriangleEqual": "⊴",
		"LeftUpDownVector": "⥑",
		"LeftUpTeeVector": "⥠",
		"LeftUpVectorBar": "⥘",
		"LeftUpVector": "↿",
		"LeftVectorBar": "⥒",
		"LeftVector": "↼",
		"lEg": "⪋",
		"leg": "⋚",
		"leq": "≤",
		"leqq": "≦",
		"leqslant": "⩽",
		"lescc": "⪨",
		"les": "⩽",
		"lesdot": "⩿",
		"lesdoto": "⪁",
		"lesdotor": "⪃",
		"lesg": "⋚︀",
		"lesges": "⪓",
		"lessapprox": "⪅",
		"lessdot": "⋖",
		"lesseqgtr": "⋚",
		"lesseqqgtr": "⪋",
		"LessEqualGreater": "⋚",
		"LessFullEqual": "≦",
		"LessGreater": "≶",
		"lessgtr": "≶",
		"LessLess": "⪡",
		"lesssim": "≲",
		"LessSlantEqual": "⩽",
		"LessTilde": "≲",
		"lfisht": "⥼",
		"lfloor": "⌊",
		"Lfr": "𝔏",
		"lfr": "𝔩",
		"lg": "≶",
		"lgE": "⪑",
		"lHar": "⥢",
		"lhard": "↽",
		"lharu": "↼",
		"lharul": "⥪",
		"lhblk": "▄",
		"LJcy": "Љ",
		"ljcy": "љ",
		"llarr": "⇇",
		"ll": "≪",
		"Ll": "⋘",
		"llcorner": "⌞",
		"Lleftarrow": "⇚",
		"llhard": "⥫",
		"lltri": "◺",
		"Lmidot": "Ŀ",
		"lmidot": "ŀ",
		"lmoustache": "⎰",
		"lmoust": "⎰",
		"lnap": "⪉",
		"lnapprox": "⪉",
		"lne": "⪇",
		"lnE": "≨",
		"lneq": "⪇",
		"lneqq": "≨",
		"lnsim": "⋦",
		"loang": "⟬",
		"loarr": "⇽",
		"lobrk": "⟦",
		"longleftarrow": "⟵",
		"LongLeftArrow": "⟵",
		"Longleftarrow": "⟸",
		"longleftrightarrow": "⟷",
		"LongLeftRightArrow": "⟷",
		"Longleftrightarrow": "⟺",
		"longmapsto": "⟼",
		"longrightarrow": "⟶",
		"LongRightArrow": "⟶",
		"Longrightarrow": "⟹",
		"looparrowleft": "↫",
		"looparrowright": "↬",
		"lopar": "⦅",
		"Lopf": "𝕃",
		"lopf": "𝕝",
		"loplus": "⨭",
		"lotimes": "⨴",
		"lowast": "∗",
		"lowbar": "_",
		"LowerLeftArrow": "↙",
		"LowerRightArrow": "↘",
		"loz": "◊",
		"lozenge": "◊",
		"lozf": "⧫",
		"lpar": "(",
		"lparlt": "⦓",
		"lrarr": "⇆",
		"lrcorner": "⌟",
		"lrhar": "⇋",
		"lrhard": "⥭",
		"lrm": "‎",
		"lrtri": "⊿",
		"lsaquo": "‹",
		"lscr": "𝓁",
		"Lscr": "ℒ",
		"lsh": "↰",
		"Lsh": "↰",
		"lsim": "≲",
		"lsime": "⪍",
		"lsimg": "⪏",
		"lsqb": "[",
		"lsquo": "‘",
		"lsquor": "‚",
		"Lstrok": "Ł",
		"lstrok": "ł",
		"ltcc": "⪦",
		"ltcir": "⩹",
		"lt": "<",
		"LT": "<",
		"Lt": "≪",
		"ltdot": "⋖",
		"lthree": "⋋",
		"ltimes": "⋉",
		"ltlarr": "⥶",
		"ltquest": "⩻",
		"ltri": "◃",
		"ltrie": "⊴",
		"ltrif": "◂",
		"ltrPar": "⦖",
		"lurdshar": "⥊",
		"luruhar": "⥦",
		"lvertneqq": "≨︀",
		"lvnE": "≨︀",
		"macr": "¯",
		"male": "♂",
		"malt": "✠",
		"maltese": "✠",
		"Map": "⤅",
		"map": "↦",
		"mapsto": "↦",
		"mapstodown": "↧",
		"mapstoleft": "↤",
		"mapstoup": "↥",
		"marker": "▮",
		"mcomma": "⨩",
		"Mcy": "М",
		"mcy": "м",
		"mdash": "—",
		"mDDot": "∺",
		"measuredangle": "∡",
		"MediumSpace": " ",
		"Mellintrf": "ℳ",
		"Mfr": "𝔐",
		"mfr": "𝔪",
		"mho": "℧",
		"micro": "µ",
		"midast": "*",
		"midcir": "⫰",
		"mid": "∣",
		"middot": "·",
		"minusb": "⊟",
		"minus": "−",
		"minusd": "∸",
		"minusdu": "⨪",
		"MinusPlus": "∓",
		"mlcp": "⫛",
		"mldr": "…",
		"mnplus": "∓",
		"models": "⊧",
		"Mopf": "𝕄",
		"mopf": "𝕞",
		"mp": "∓",
		"mscr": "𝓂",
		"Mscr": "ℳ",
		"mstpos": "∾",
		"Mu": "Μ",
		"mu": "μ",
		"multimap": "⊸",
		"mumap": "⊸",
		"nabla": "∇",
		"Nacute": "Ń",
		"nacute": "ń",
		"nang": "∠⃒",
		"nap": "≉",
		"napE": "⩰̸",
		"napid": "≋̸",
		"napos": "ŉ",
		"napprox": "≉",
		"natural": "♮",
		"naturals": "ℕ",
		"natur": "♮",
		"nbsp": " ",
		"nbump": "≎̸",
		"nbumpe": "≏̸",
		"ncap": "⩃",
		"Ncaron": "Ň",
		"ncaron": "ň",
		"Ncedil": "Ņ",
		"ncedil": "ņ",
		"ncong": "≇",
		"ncongdot": "⩭̸",
		"ncup": "⩂",
		"Ncy": "Н",
		"ncy": "н",
		"ndash": "–",
		"nearhk": "⤤",
		"nearr": "↗",
		"neArr": "⇗",
		"nearrow": "↗",
		"ne": "≠",
		"nedot": "≐̸",
		"NegativeMediumSpace": "​",
		"NegativeThickSpace": "​",
		"NegativeThinSpace": "​",
		"NegativeVeryThinSpace": "​",
		"nequiv": "≢",
		"nesear": "⤨",
		"nesim": "≂̸",
		"NestedGreaterGreater": "≫",
		"NestedLessLess": "≪",
		"NewLine": "\n",
		"nexist": "∄",
		"nexists": "∄",
		"Nfr": "𝔑",
		"nfr": "𝔫",
		"ngE": "≧̸",
		"nge": "≱",
		"ngeq": "≱",
		"ngeqq": "≧̸",
		"ngeqslant": "⩾̸",
		"nges": "⩾̸",
		"nGg": "⋙̸",
		"ngsim": "≵",
		"nGt": "≫⃒",
		"ngt": "≯",
		"ngtr": "≯",
		"nGtv": "≫̸",
		"nharr": "↮",
		"nhArr": "⇎",
		"nhpar": "⫲",
		"ni": "∋",
		"nis": "⋼",
		"nisd": "⋺",
		"niv": "∋",
		"NJcy": "Њ",
		"njcy": "њ",
		"nlarr": "↚",
		"nlArr": "⇍",
		"nldr": "‥",
		"nlE": "≦̸",
		"nle": "≰",
		"nleftarrow": "↚",
		"nLeftarrow": "⇍",
		"nleftrightarrow": "↮",
		"nLeftrightarrow": "⇎",
		"nleq": "≰",
		"nleqq": "≦̸",
		"nleqslant": "⩽̸",
		"nles": "⩽̸",
		"nless": "≮",
		"nLl": "⋘̸",
		"nlsim": "≴",
		"nLt": "≪⃒",
		"nlt": "≮",
		"nltri": "⋪",
		"nltrie": "⋬",
		"nLtv": "≪̸",
		"nmid": "∤",
		"NoBreak": "⁠",
		"NonBreakingSpace": " ",
		"nopf": "𝕟",
		"Nopf": "ℕ",
		"Not": "⫬",
		"not": "¬",
		"NotCongruent": "≢",
		"NotCupCap": "≭",
		"NotDoubleVerticalBar": "∦",
		"NotElement": "∉",
		"NotEqual": "≠",
		"NotEqualTilde": "≂̸",
		"NotExists": "∄",
		"NotGreater": "≯",
		"NotGreaterEqual": "≱",
		"NotGreaterFullEqual": "≧̸",
		"NotGreaterGreater": "≫̸",
		"NotGreaterLess": "≹",
		"NotGreaterSlantEqual": "⩾̸",
		"NotGreaterTilde": "≵",
		"NotHumpDownHump": "≎̸",
		"NotHumpEqual": "≏̸",
		"notin": "∉",
		"notindot": "⋵̸",
		"notinE": "⋹̸",
		"notinva": "∉",
		"notinvb": "⋷",
		"notinvc": "⋶",
		"NotLeftTriangleBar": "⧏̸",
		"NotLeftTriangle": "⋪",
		"NotLeftTriangleEqual": "⋬",
		"NotLess": "≮",
		"NotLessEqual": "≰",
		"NotLessGreater": "≸",
		"NotLessLess": "≪̸",
		"NotLessSlantEqual": "⩽̸",
		"NotLessTilde": "≴",
		"NotNestedGreaterGreater": "⪢̸",
		"NotNestedLessLess": "⪡̸",
		"notni": "∌",
		"notniva": "∌",
		"notnivb": "⋾",
		"notnivc": "⋽",
		"NotPrecedes": "⊀",
		"NotPrecedesEqual": "⪯̸",
		"NotPrecedesSlantEqual": "⋠",
		"NotReverseElement": "∌",
		"NotRightTriangleBar": "⧐̸",
		"NotRightTriangle": "⋫",
		"NotRightTriangleEqual": "⋭",
		"NotSquareSubset": "⊏̸",
		"NotSquareSubsetEqual": "⋢",
		"NotSquareSuperset": "⊐̸",
		"NotSquareSupersetEqual": "⋣",
		"NotSubset": "⊂⃒",
		"NotSubsetEqual": "⊈",
		"NotSucceeds": "⊁",
		"NotSucceedsEqual": "⪰̸",
		"NotSucceedsSlantEqual": "⋡",
		"NotSucceedsTilde": "≿̸",
		"NotSuperset": "⊃⃒",
		"NotSupersetEqual": "⊉",
		"NotTilde": "≁",
		"NotTildeEqual": "≄",
		"NotTildeFullEqual": "≇",
		"NotTildeTilde": "≉",
		"NotVerticalBar": "∤",
		"nparallel": "∦",
		"npar": "∦",
		"nparsl": "⫽⃥",
		"npart": "∂̸",
		"npolint": "⨔",
		"npr": "⊀",
		"nprcue": "⋠",
		"nprec": "⊀",
		"npreceq": "⪯̸",
		"npre": "⪯̸",
		"nrarrc": "⤳̸",
		"nrarr": "↛",
		"nrArr": "⇏",
		"nrarrw": "↝̸",
		"nrightarrow": "↛",
		"nRightarrow": "⇏",
		"nrtri": "⋫",
		"nrtrie": "⋭",
		"nsc": "⊁",
		"nsccue": "⋡",
		"nsce": "⪰̸",
		"Nscr": "𝒩",
		"nscr": "𝓃",
		"nshortmid": "∤",
		"nshortparallel": "∦",
		"nsim": "≁",
		"nsime": "≄",
		"nsimeq": "≄",
		"nsmid": "∤",
		"nspar": "∦",
		"nsqsube": "⋢",
		"nsqsupe": "⋣",
		"nsub": "⊄",
		"nsubE": "⫅̸",
		"nsube": "⊈",
		"nsubset": "⊂⃒",
		"nsubseteq": "⊈",
		"nsubseteqq": "⫅̸",
		"nsucc": "⊁",
		"nsucceq": "⪰̸",
		"nsup": "⊅",
		"nsupE": "⫆̸",
		"nsupe": "⊉",
		"nsupset": "⊃⃒",
		"nsupseteq": "⊉",
		"nsupseteqq": "⫆̸",
		"ntgl": "≹",
		"Ntilde": "Ñ",
		"ntilde": "ñ",
		"ntlg": "≸",
		"ntriangleleft": "⋪",
		"ntrianglelefteq": "⋬",
		"ntriangleright": "⋫",
		"ntrianglerighteq": "⋭",
		"Nu": "Ν",
		"nu": "ν",
		"num": "#",
		"numero": "№",
		"numsp": " ",
		"nvap": "≍⃒",
		"nvdash": "⊬",
		"nvDash": "⊭",
		"nVdash": "⊮",
		"nVDash": "⊯",
		"nvge": "≥⃒",
		"nvgt": ">⃒",
		"nvHarr": "⤄",
		"nvinfin": "⧞",
		"nvlArr": "⤂",
		"nvle": "≤⃒",
		"nvlt": "<⃒",
		"nvltrie": "⊴⃒",
		"nvrArr": "⤃",
		"nvrtrie": "⊵⃒",
		"nvsim": "∼⃒",
		"nwarhk": "⤣",
		"nwarr": "↖",
		"nwArr": "⇖",
		"nwarrow": "↖",
		"nwnear": "⤧",
		"Oacute": "Ó",
		"oacute": "ó",
		"oast": "⊛",
		"Ocirc": "Ô",
		"ocirc": "ô",
		"ocir": "⊚",
		"Ocy": "О",
		"ocy": "о",
		"odash": "⊝",
		"Odblac": "Ő",
		"odblac": "ő",
		"odiv": "⨸",
		"odot": "⊙",
		"odsold": "⦼",
		"OElig": "Œ",
		"oelig": "œ",
		"ofcir": "⦿",
		"Ofr": "𝔒",
		"ofr": "𝔬",
		"ogon": "˛",
		"Ograve": "Ò",
		"ograve": "ò",
		"ogt": "⧁",
		"ohbar": "⦵",
		"ohm": "Ω",
		"oint": "∮",
		"olarr": "↺",
		"olcir": "⦾",
		"olcross": "⦻",
		"oline": "‾",
		"olt": "⧀",
		"Omacr": "Ō",
		"omacr": "ō",
		"Omega": "Ω",
		"omega": "ω",
		"Omicron": "Ο",
		"omicron": "ο",
		"omid": "⦶",
		"ominus": "⊖",
		"Oopf": "𝕆",
		"oopf": "𝕠",
		"opar": "⦷",
		"OpenCurlyDoubleQuote": "“",
		"OpenCurlyQuote": "‘",
		"operp": "⦹",
		"oplus": "⊕",
		"orarr": "↻",
		"Or": "⩔",
		"or": "∨",
		"ord": "⩝",
		"order": "ℴ",
		"orderof": "ℴ",
		"ordf": "ª",
		"ordm": "º",
		"origof": "⊶",
		"oror": "⩖",
		"orslope": "⩗",
		"orv": "⩛",
		"oS": "Ⓢ",
		"Oscr": "𝒪",
		"oscr": "ℴ",
		"Oslash": "Ø",
		"oslash": "ø",
		"osol": "⊘",
		"Otilde": "Õ",
		"otilde": "õ",
		"otimesas": "⨶",
		"Otimes": "⨷",
		"otimes": "⊗",
		"Ouml": "Ö",
		"ouml": "ö",
		"ovbar": "⌽",
		"OverBar": "‾",
		"OverBrace": "⏞",
		"OverBracket": "⎴",
		"OverParenthesis": "⏜",
		"para": "¶",
		"parallel": "∥",
		"par": "∥",
		"parsim": "⫳",
		"parsl": "⫽",
		"part": "∂",
		"PartialD": "∂",
		"Pcy": "П",
		"pcy": "п",
		"percnt": "%",
		"period": ".",
		"permil": "‰",
		"perp": "⊥",
		"pertenk": "‱",
		"Pfr": "𝔓",
		"pfr": "𝔭",
		"Phi": "Φ",
		"phi": "φ",
		"phiv": "ϕ",
		"phmmat": "ℳ",
		"phone": "☎",
		"Pi": "Π",
		"pi": "π",
		"pitchfork": "⋔",
		"piv": "ϖ",
		"planck": "ℏ",
		"planckh": "ℎ",
		"plankv": "ℏ",
		"plusacir": "⨣",
		"plusb": "⊞",
		"pluscir": "⨢",
		"plus": "+",
		"plusdo": "∔",
		"plusdu": "⨥",
		"pluse": "⩲",
		"PlusMinus": "±",
		"plusmn": "±",
		"plussim": "⨦",
		"plustwo": "⨧",
		"pm": "±",
		"Poincareplane": "ℌ",
		"pointint": "⨕",
		"popf": "𝕡",
		"Popf": "ℙ",
		"pound": "£",
		"prap": "⪷",
		"Pr": "⪻",
		"pr": "≺",
		"prcue": "≼",
		"precapprox": "⪷",
		"prec": "≺",
		"preccurlyeq": "≼",
		"Precedes": "≺",
		"PrecedesEqual": "⪯",
		"PrecedesSlantEqual": "≼",
		"PrecedesTilde": "≾",
		"preceq": "⪯",
		"precnapprox": "⪹",
		"precneqq": "⪵",
		"precnsim": "⋨",
		"pre": "⪯",
		"prE": "⪳",
		"precsim": "≾",
		"prime": "′",
		"Prime": "″",
		"primes": "ℙ",
		"prnap": "⪹",
		"prnE": "⪵",
		"prnsim": "⋨",
		"prod": "∏",
		"Product": "∏",
		"profalar": "⌮",
		"profline": "⌒",
		"profsurf": "⌓",
		"prop": "∝",
		"Proportional": "∝",
		"Proportion": "∷",
		"propto": "∝",
		"prsim": "≾",
		"prurel": "⊰",
		"Pscr": "𝒫",
		"pscr": "𝓅",
		"Psi": "Ψ",
		"psi": "ψ",
		"puncsp": " ",
		"Qfr": "𝔔",
		"qfr": "𝔮",
		"qint": "⨌",
		"qopf": "𝕢",
		"Qopf": "ℚ",
		"qprime": "⁗",
		"Qscr": "𝒬",
		"qscr": "𝓆",
		"quaternions": "ℍ",
		"quatint": "⨖",
		"quest": "?",
		"questeq": "≟",
		"quot": "\"",
		"QUOT": "\"",
		"rAarr": "⇛",
		"race": "∽̱",
		"Racute": "Ŕ",
		"racute": "ŕ",
		"radic": "√",
		"raemptyv": "⦳",
		"rang": "⟩",
		"Rang": "⟫",
		"rangd": "⦒",
		"range": "⦥",
		"rangle": "⟩",
		"raquo": "»",
		"rarrap": "⥵",
		"rarrb": "⇥",
		"rarrbfs": "⤠",
		"rarrc": "⤳",
		"rarr": "→",
		"Rarr": "↠",
		"rArr": "⇒",
		"rarrfs": "⤞",
		"rarrhk": "↪",
		"rarrlp": "↬",
		"rarrpl": "⥅",
		"rarrsim": "⥴",
		"Rarrtl": "⤖",
		"rarrtl": "↣",
		"rarrw": "↝",
		"ratail": "⤚",
		"rAtail": "⤜",
		"ratio": "∶",
		"rationals": "ℚ",
		"rbarr": "⤍",
		"rBarr": "⤏",
		"RBarr": "⤐",
		"rbbrk": "❳",
		"rbrace": "}",
		"rbrack": "]",
		"rbrke": "⦌",
		"rbrksld": "⦎",
		"rbrkslu": "⦐",
		"Rcaron": "Ř",
		"rcaron": "ř",
		"Rcedil": "Ŗ",
		"rcedil": "ŗ",
		"rceil": "⌉",
		"rcub": "}",
		"Rcy": "Р",
		"rcy": "р",
		"rdca": "⤷",
		"rdldhar": "⥩",
		"rdquo": "”",
		"rdquor": "”",
		"rdsh": "↳",
		"real": "ℜ",
		"realine": "ℛ",
		"realpart": "ℜ",
		"reals": "ℝ",
		"Re": "ℜ",
		"rect": "▭",
		"reg": "®",
		"REG": "®",
		"ReverseElement": "∋",
		"ReverseEquilibrium": "⇋",
		"ReverseUpEquilibrium": "⥯",
		"rfisht": "⥽",
		"rfloor": "⌋",
		"rfr": "𝔯",
		"Rfr": "ℜ",
		"rHar": "⥤",
		"rhard": "⇁",
		"rharu": "⇀",
		"rharul": "⥬",
		"Rho": "Ρ",
		"rho": "ρ",
		"rhov": "ϱ",
		"RightAngleBracket": "⟩",
		"RightArrowBar": "⇥",
		"rightarrow": "→",
		"RightArrow": "→",
		"Rightarrow": "⇒",
		"RightArrowLeftArrow": "⇄",
		"rightarrowtail": "↣",
		"RightCeiling": "⌉",
		"RightDoubleBracket": "⟧",
		"RightDownTeeVector": "⥝",
		"RightDownVectorBar": "⥕",
		"RightDownVector": "⇂",
		"RightFloor": "⌋",
		"rightharpoondown": "⇁",
		"rightharpoonup": "⇀",
		"rightleftarrows": "⇄",
		"rightleftharpoons": "⇌",
		"rightrightarrows": "⇉",
		"rightsquigarrow": "↝",
		"RightTeeArrow": "↦",
		"RightTee": "⊢",
		"RightTeeVector": "⥛",
		"rightthreetimes": "⋌",
		"RightTriangleBar": "⧐",
		"RightTriangle": "⊳",
		"RightTriangleEqual": "⊵",
		"RightUpDownVector": "⥏",
		"RightUpTeeVector": "⥜",
		"RightUpVectorBar": "⥔",
		"RightUpVector": "↾",
		"RightVectorBar": "⥓",
		"RightVector": "⇀",
		"ring": "˚",
		"risingdotseq": "≓",
		"rlarr": "⇄",
		"rlhar": "⇌",
		"rlm": "‏",
		"rmoustache": "⎱",
		"rmoust": "⎱",
		"rnmid": "⫮",
		"roang": "⟭",
		"roarr": "⇾",
		"robrk": "⟧",
		"ropar": "⦆",
		"ropf": "𝕣",
		"Ropf": "ℝ",
		"roplus": "⨮",
		"rotimes": "⨵",
		"RoundImplies": "⥰",
		"rpar": ")",
		"rpargt": "⦔",
		"rppolint": "⨒",
		"rrarr": "⇉",
		"Rrightarrow": "⇛",
		"rsaquo": "›",
		"rscr": "𝓇",
		"Rscr": "ℛ",
		"rsh": "↱",
		"Rsh": "↱",
		"rsqb": "]",
		"rsquo": "’",
		"rsquor": "’",
		"rthree": "⋌",
		"rtimes": "⋊",
		"rtri": "▹",
		"rtrie": "⊵",
		"rtrif": "▸",
		"rtriltri": "⧎",
		"RuleDelayed": "⧴",
		"ruluhar": "⥨",
		"rx": "℞",
		"Sacute": "Ś",
		"sacute": "ś",
		"sbquo": "‚",
		"scap": "⪸",
		"Scaron": "Š",
		"scaron": "š",
		"Sc": "⪼",
		"sc": "≻",
		"sccue": "≽",
		"sce": "⪰",
		"scE": "⪴",
		"Scedil": "Ş",
		"scedil": "ş",
		"Scirc": "Ŝ",
		"scirc": "ŝ",
		"scnap": "⪺",
		"scnE": "⪶",
		"scnsim": "⋩",
		"scpolint": "⨓",
		"scsim": "≿",
		"Scy": "С",
		"scy": "с",
		"sdotb": "⊡",
		"sdot": "⋅",
		"sdote": "⩦",
		"searhk": "⤥",
		"searr": "↘",
		"seArr": "⇘",
		"searrow": "↘",
		"sect": "§",
		"semi": ";",
		"seswar": "⤩",
		"setminus": "∖",
		"setmn": "∖",
		"sext": "✶",
		"Sfr": "𝔖",
		"sfr": "𝔰",
		"sfrown": "⌢",
		"sharp": "♯",
		"SHCHcy": "Щ",
		"shchcy": "щ",
		"SHcy": "Ш",
		"shcy": "ш",
		"ShortDownArrow": "↓",
		"ShortLeftArrow": "←",
		"shortmid": "∣",
		"shortparallel": "∥",
		"ShortRightArrow": "→",
		"ShortUpArrow": "↑",
		"shy": "­",
		"Sigma": "Σ",
		"sigma": "σ",
		"sigmaf": "ς",
		"sigmav": "ς",
		"sim": "∼",
		"simdot": "⩪",
		"sime": "≃",
		"simeq": "≃",
		"simg": "⪞",
		"simgE": "⪠",
		"siml": "⪝",
		"simlE": "⪟",
		"simne": "≆",
		"simplus": "⨤",
		"simrarr": "⥲",
		"slarr": "←",
		"SmallCircle": "∘",
		"smallsetminus": "∖",
		"smashp": "⨳",
		"smeparsl": "⧤",
		"smid": "∣",
		"smile": "⌣",
		"smt": "⪪",
		"smte": "⪬",
		"smtes": "⪬︀",
		"SOFTcy": "Ь",
		"softcy": "ь",
		"solbar": "⌿",
		"solb": "⧄",
		"sol": "/",
		"Sopf": "𝕊",
		"sopf": "𝕤",
		"spades": "♠",
		"spadesuit": "♠",
		"spar": "∥",
		"sqcap": "⊓",
		"sqcaps": "⊓︀",
		"sqcup": "⊔",
		"sqcups": "⊔︀",
		"Sqrt": "√",
		"sqsub": "⊏",
		"sqsube": "⊑",
		"sqsubset": "⊏",
		"sqsubseteq": "⊑",
		"sqsup": "⊐",
		"sqsupe": "⊒",
		"sqsupset": "⊐",
		"sqsupseteq": "⊒",
		"square": "□",
		"Square": "□",
		"SquareIntersection": "⊓",
		"SquareSubset": "⊏",
		"SquareSubsetEqual": "⊑",
		"SquareSuperset": "⊐",
		"SquareSupersetEqual": "⊒",
		"SquareUnion": "⊔",
		"squarf": "▪",
		"squ": "□",
		"squf": "▪",
		"srarr": "→",
		"Sscr": "𝒮",
		"sscr": "𝓈",
		"ssetmn": "∖",
		"ssmile": "⌣",
		"sstarf": "⋆",
		"Star": "⋆",
		"star": "☆",
		"starf": "★",
		"straightepsilon": "ϵ",
		"straightphi": "ϕ",
		"strns": "¯",
		"sub": "⊂",
		"Sub": "⋐",
		"subdot": "⪽",
		"subE": "⫅",
		"sube": "⊆",
		"subedot": "⫃",
		"submult": "⫁",
		"subnE": "⫋",
		"subne": "⊊",
		"subplus": "⪿",
		"subrarr": "⥹",
		"subset": "⊂",
		"Subset": "⋐",
		"subseteq": "⊆",
		"subseteqq": "⫅",
		"SubsetEqual": "⊆",
		"subsetneq": "⊊",
		"subsetneqq": "⫋",
		"subsim": "⫇",
		"subsub": "⫕",
		"subsup": "⫓",
		"succapprox": "⪸",
		"succ": "≻",
		"succcurlyeq": "≽",
		"Succeeds": "≻",
		"SucceedsEqual": "⪰",
		"SucceedsSlantEqual": "≽",
		"SucceedsTilde": "≿",
		"succeq": "⪰",
		"succnapprox": "⪺",
		"succneqq": "⪶",
		"succnsim": "⋩",
		"succsim": "≿",
		"SuchThat": "∋",
		"sum": "∑",
		"Sum": "∑",
		"sung": "♪",
		"sup1": "¹",
		"sup2": "²",
		"sup3": "³",
		"sup": "⊃",
		"Sup": "⋑",
		"supdot": "⪾",
		"supdsub": "⫘",
		"supE": "⫆",
		"supe": "⊇",
		"supedot": "⫄",
		"Superset": "⊃",
		"SupersetEqual": "⊇",
		"suphsol": "⟉",
		"suphsub": "⫗",
		"suplarr": "⥻",
		"supmult": "⫂",
		"supnE": "⫌",
		"supne": "⊋",
		"supplus": "⫀",
		"supset": "⊃",
		"Supset": "⋑",
		"supseteq": "⊇",
		"supseteqq": "⫆",
		"supsetneq": "⊋",
		"supsetneqq": "⫌",
		"supsim": "⫈",
		"supsub": "⫔",
		"supsup": "⫖",
		"swarhk": "⤦",
		"swarr": "↙",
		"swArr": "⇙",
		"swarrow": "↙",
		"swnwar": "⤪",
		"szlig": "ß",
		"Tab": "\t",
		"target": "⌖",
		"Tau": "Τ",
		"tau": "τ",
		"tbrk": "⎴",
		"Tcaron": "Ť",
		"tcaron": "ť",
		"Tcedil": "Ţ",
		"tcedil": "ţ",
		"Tcy": "Т",
		"tcy": "т",
		"tdot": "⃛",
		"telrec": "⌕",
		"Tfr": "𝔗",
		"tfr": "𝔱",
		"there4": "∴",
		"therefore": "∴",
		"Therefore": "∴",
		"Theta": "Θ",
		"theta": "θ",
		"thetasym": "ϑ",
		"thetav": "ϑ",
		"thickapprox": "≈",
		"thicksim": "∼",
		"ThickSpace": "  ",
		"ThinSpace": " ",
		"thinsp": " ",
		"thkap": "≈",
		"thksim": "∼",
		"THORN": "Þ",
		"thorn": "þ",
		"tilde": "˜",
		"Tilde": "∼",
		"TildeEqual": "≃",
		"TildeFullEqual": "≅",
		"TildeTilde": "≈",
		"timesbar": "⨱",
		"timesb": "⊠",
		"times": "×",
		"timesd": "⨰",
		"tint": "∭",
		"toea": "⤨",
		"topbot": "⌶",
		"topcir": "⫱",
		"top": "⊤",
		"Topf": "𝕋",
		"topf": "𝕥",
		"topfork": "⫚",
		"tosa": "⤩",
		"tprime": "‴",
		"trade": "™",
		"TRADE": "™",
		"triangle": "▵",
		"triangledown": "▿",
		"triangleleft": "◃",
		"trianglelefteq": "⊴",
		"triangleq": "≜",
		"triangleright": "▹",
		"trianglerighteq": "⊵",
		"tridot": "◬",
		"trie": "≜",
		"triminus": "⨺",
		"TripleDot": "⃛",
		"triplus": "⨹",
		"trisb": "⧍",
		"tritime": "⨻",
		"trpezium": "⏢",
		"Tscr": "𝒯",
		"tscr": "𝓉",
		"TScy": "Ц",
		"tscy": "ц",
		"TSHcy": "Ћ",
		"tshcy": "ћ",
		"Tstrok": "Ŧ",
		"tstrok": "ŧ",
		"twixt": "≬",
		"twoheadleftarrow": "↞",
		"twoheadrightarrow": "↠",
		"Uacute": "Ú",
		"uacute": "ú",
		"uarr": "↑",
		"Uarr": "↟",
		"uArr": "⇑",
		"Uarrocir": "⥉",
		"Ubrcy": "Ў",
		"ubrcy": "ў",
		"Ubreve": "Ŭ",
		"ubreve": "ŭ",
		"Ucirc": "Û",
		"ucirc": "û",
		"Ucy": "У",
		"ucy": "у",
		"udarr": "⇅",
		"Udblac": "Ű",
		"udblac": "ű",
		"udhar": "⥮",
		"ufisht": "⥾",
		"Ufr": "𝔘",
		"ufr": "𝔲",
		"Ugrave": "Ù",
		"ugrave": "ù",
		"uHar": "⥣",
		"uharl": "↿",
		"uharr": "↾",
		"uhblk": "▀",
		"ulcorn": "⌜",
		"ulcorner": "⌜",
		"ulcrop": "⌏",
		"ultri": "◸",
		"Umacr": "Ū",
		"umacr": "ū",
		"uml": "¨",
		"UnderBar": "_",
		"UnderBrace": "⏟",
		"UnderBracket": "⎵",
		"UnderParenthesis": "⏝",
		"Union": "⋃",
		"UnionPlus": "⊎",
		"Uogon": "Ų",
		"uogon": "ų",
		"Uopf": "𝕌",
		"uopf": "𝕦",
		"UpArrowBar": "⤒",
		"uparrow": "↑",
		"UpArrow": "↑",
		"Uparrow": "⇑",
		"UpArrowDownArrow": "⇅",
		"updownarrow": "↕",
		"UpDownArrow": "↕",
		"Updownarrow": "⇕",
		"UpEquilibrium": "⥮",
		"upharpoonleft": "↿",
		"upharpoonright": "↾",
		"uplus": "⊎",
		"UpperLeftArrow": "↖",
		"UpperRightArrow": "↗",
		"upsi": "υ",
		"Upsi": "ϒ",
		"upsih": "ϒ",
		"Upsilon": "Υ",
		"upsilon": "υ",
		"UpTeeArrow": "↥",
		"UpTee": "⊥",
		"upuparrows": "⇈",
		"urcorn": "⌝",
		"urcorner": "⌝",
		"urcrop": "⌎",
		"Uring": "Ů",
		"uring": "ů",
		"urtri": "◹",
		"Uscr": "𝒰",
		"uscr": "𝓊",
		"utdot": "⋰",
		"Utilde": "Ũ",
		"utilde": "ũ",
		"utri": "▵",
		"utrif": "▴",
		"uuarr": "⇈",
		"Uuml": "Ü",
		"uuml": "ü",
		"uwangle": "⦧",
		"vangrt": "⦜",
		"varepsilon": "ϵ",
		"varkappa": "ϰ",
		"varnothing": "∅",
		"varphi": "ϕ",
		"varpi": "ϖ",
		"varpropto": "∝",
		"varr": "↕",
		"vArr": "⇕",
		"varrho": "ϱ",
		"varsigma": "ς",
		"varsubsetneq": "⊊︀",
		"varsubsetneqq": "⫋︀",
		"varsupsetneq": "⊋︀",
		"varsupsetneqq": "⫌︀",
		"vartheta": "ϑ",
		"vartriangleleft": "⊲",
		"vartriangleright": "⊳",
		"vBar": "⫨",
		"Vbar": "⫫",
		"vBarv": "⫩",
		"Vcy": "В",
		"vcy": "в",
		"vdash": "⊢",
		"vDash": "⊨",
		"Vdash": "⊩",
		"VDash": "⊫",
		"Vdashl": "⫦",
		"veebar": "⊻",
		"vee": "∨",
		"Vee": "⋁",
		"veeeq": "≚",
		"vellip": "⋮",
		"verbar": "|",
		"Verbar": "‖",
		"vert": "|",
		"Vert": "‖",
		"VerticalBar": "∣",
		"VerticalLine": "|",
		"VerticalSeparator": "❘",
		"VerticalTilde": "≀",
		"VeryThinSpace": " ",
		"Vfr": "𝔙",
		"vfr": "𝔳",
		"vltri": "⊲",
		"vnsub": "⊂⃒",
		"vnsup": "⊃⃒",
		"Vopf": "𝕍",
		"vopf": "𝕧",
		"vprop": "∝",
		"vrtri": "⊳",
		"Vscr": "𝒱",
		"vscr": "𝓋",
		"vsubnE": "⫋︀",
		"vsubne": "⊊︀",
		"vsupnE": "⫌︀",
		"vsupne": "⊋︀",
		"Vvdash": "⊪",
		"vzigzag": "⦚",
		"Wcirc": "Ŵ",
		"wcirc": "ŵ",
		"wedbar": "⩟",
		"wedge": "∧",
		"Wedge": "⋀",
		"wedgeq": "≙",
		"weierp": "℘",
		"Wfr": "𝔚",
		"wfr": "𝔴",
		"Wopf": "𝕎",
		"wopf": "𝕨",
		"wp": "℘",
		"wr": "≀",
		"wreath": "≀",
		"Wscr": "𝒲",
		"wscr": "𝓌",
		"xcap": "⋂",
		"xcirc": "◯",
		"xcup": "⋃",
		"xdtri": "▽",
		"Xfr": "𝔛",
		"xfr": "𝔵",
		"xharr": "⟷",
		"xhArr": "⟺",
		"Xi": "Ξ",
		"xi": "ξ",
		"xlarr": "⟵",
		"xlArr": "⟸",
		"xmap": "⟼",
		"xnis": "⋻",
		"xodot": "⨀",
		"Xopf": "𝕏",
		"xopf": "𝕩",
		"xoplus": "⨁",
		"xotime": "⨂",
		"xrarr": "⟶",
		"xrArr": "⟹",
		"Xscr": "𝒳",
		"xscr": "𝓍",
		"xsqcup": "⨆",
		"xuplus": "⨄",
		"xutri": "△",
		"xvee": "⋁",
		"xwedge": "⋀",
		"Yacute": "Ý",
		"yacute": "ý",
		"YAcy": "Я",
		"yacy": "я",
		"Ycirc": "Ŷ",
		"ycirc": "ŷ",
		"Ycy": "Ы",
		"ycy": "ы",
		"yen": "¥",
		"Yfr": "𝔜",
		"yfr": "𝔶",
		"YIcy": "Ї",
		"yicy": "ї",
		"Yopf": "𝕐",
		"yopf": "𝕪",
		"Yscr": "𝒴",
		"yscr": "𝓎",
		"YUcy": "Ю",
		"yucy": "ю",
		"yuml": "ÿ",
		"Yuml": "Ÿ",
		"Zacute": "Ź",
		"zacute": "ź",
		"Zcaron": "Ž",
		"zcaron": "ž",
		"Zcy": "З",
		"zcy": "з",
		"Zdot": "Ż",
		"zdot": "ż",
		"zeetrf": "ℨ",
		"ZeroWidthSpace": "​",
		"Zeta": "Ζ",
		"zeta": "ζ",
		"zfr": "𝔷",
		"Zfr": "ℨ",
		"ZHcy": "Ж",
		"zhcy": "ж",
		"zigrarr": "⇝",
		"zopf": "𝕫",
		"Zopf": "ℤ",
		"Zscr": "𝒵",
		"zscr": "𝓏",
		"zwj": "‍",
		"zwnj": "‌"
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports=/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E44\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD807[\uDC41-\uDC45\uDC70\uDC71]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	module.exports.encode = __webpack_require__(9);
	module.exports.decode = __webpack_require__(10);
	module.exports.format = __webpack_require__(11);
	module.exports.parse  = __webpack_require__(12);


/***/ },
/* 9 */
/***/ function(module, exports) {

	
	'use strict';


	var encodeCache = {};


	// Create a lookup array where anything but characters in `chars` string
	// and alphanumeric chars is percent-encoded.
	//
	function getEncodeCache(exclude) {
	  var i, ch, cache = encodeCache[exclude];
	  if (cache) { return cache; }

	  cache = encodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);

	    if (/^[0-9a-z]$/i.test(ch)) {
	      // always allow unencoded alphanumeric characters
	      cache.push(ch);
	    } else {
	      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
	    }
	  }

	  for (i = 0; i < exclude.length; i++) {
	    cache[exclude.charCodeAt(i)] = exclude[i];
	  }

	  return cache;
	}


	// Encode unsafe characters with percent-encoding, skipping already
	// encoded sequences.
	//
	//  - string       - string to encode
	//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
	//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
	//
	function encode(string, exclude, keepEscaped) {
	  var i, l, code, nextCode, cache,
	      result = '';

	  if (typeof exclude !== 'string') {
	    // encode(string, keepEscaped)
	    keepEscaped  = exclude;
	    exclude = encode.defaultChars;
	  }

	  if (typeof keepEscaped === 'undefined') {
	    keepEscaped = true;
	  }

	  cache = getEncodeCache(exclude);

	  for (i = 0, l = string.length; i < l; i++) {
	    code = string.charCodeAt(i);

	    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
	      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
	        result += string.slice(i, i + 3);
	        i += 2;
	        continue;
	      }
	    }

	    if (code < 128) {
	      result += cache[code];
	      continue;
	    }

	    if (code >= 0xD800 && code <= 0xDFFF) {
	      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
	        nextCode = string.charCodeAt(i + 1);
	        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
	          result += encodeURIComponent(string[i] + string[i + 1]);
	          i++;
	          continue;
	        }
	      }
	      result += '%EF%BF%BD';
	      continue;
	    }

	    result += encodeURIComponent(string[i]);
	  }

	  return result;
	}

	encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
	encode.componentChars = "-_.!~*'()";


	module.exports = encode;


/***/ },
/* 10 */
/***/ function(module, exports) {

	
	'use strict';


	/* eslint-disable no-bitwise */

	var decodeCache = {};

	function getDecodeCache(exclude) {
	  var i, ch, cache = decodeCache[exclude];
	  if (cache) { return cache; }

	  cache = decodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);
	    cache.push(ch);
	  }

	  for (i = 0; i < exclude.length; i++) {
	    ch = exclude.charCodeAt(i);
	    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
	  }

	  return cache;
	}


	// Decode percent-encoded string.
	//
	function decode(string, exclude) {
	  var cache;

	  if (typeof exclude !== 'string') {
	    exclude = decode.defaultChars;
	  }

	  cache = getDecodeCache(exclude);

	  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
	    var i, l, b1, b2, b3, b4, chr,
	        result = '';

	    for (i = 0, l = seq.length; i < l; i += 3) {
	      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

	      if (b1 < 0x80) {
	        result += cache[b1];
	        continue;
	      }

	      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
	        // 110xxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

	        if ((b2 & 0xC0) === 0x80) {
	          chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

	          if (chr < 0x80) {
	            result += '\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 3;
	          continue;
	        }
	      }

	      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
	        // 1110xxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
	          chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

	          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
	            result += '\ufffd\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 6;
	          continue;
	        }
	      }

	      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
	        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
	        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
	          chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

	          if (chr < 0x10000 || chr > 0x10FFFF) {
	            result += '\ufffd\ufffd\ufffd\ufffd';
	          } else {
	            chr -= 0x10000;
	            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
	          }

	          i += 9;
	          continue;
	        }
	      }

	      result += '\ufffd';
	    }

	    return result;
	  });
	}


	decode.defaultChars   = ';/?:@&=+$,#';
	decode.componentChars = '';


	module.exports = decode;


/***/ },
/* 11 */
/***/ function(module, exports) {

	
	'use strict';


	module.exports = function format(url) {
	  var result = '';

	  result += url.protocol || '';
	  result += url.slashes ? '//' : '';
	  result += url.auth ? url.auth + '@' : '';

	  if (url.hostname && url.hostname.indexOf(':') !== -1) {
	    // ipv6 address
	    result += '[' + url.hostname + ']';
	  } else {
	    result += url.hostname || '';
	  }

	  result += url.port ? ':' + url.port : '';
	  result += url.pathname || '';
	  result += url.search || '';
	  result += url.hash || '';

	  return result;
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	//
	// Changes from joyent/node:
	//
	// 1. No leading slash in paths,
	//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
	//
	// 2. Backslashes are not replaced with slashes,
	//    so `http:\\example.org\` is treated like a relative path
	//
	// 3. Trailing colon is treated like a part of the path,
	//    i.e. in `http://example.org:foo` pathname is `:foo`
	//
	// 4. Nothing is URL-encoded in the resulting object,
	//    (in joyent/node some chars in auth and paths are encoded)
	//
	// 5. `url.parse()` does not have `parseQueryString` argument
	//
	// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
	//    which can be constructed using other parts of the url.
	//


	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.pathname = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,

	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

	    // RFC 2396: characters not allowed for various reasons.
	    unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = [ '\'' ].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
	    hostEndingChars = [ '/', '?', '#' ],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    /* eslint-disable no-script-url */
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    };
	    /* eslint-enable no-script-url */

	function urlParse(url, slashesDenoteHost) {
	  if (url && url instanceof Url) { return url; }

	  var u = new Url();
	  u.parse(url, slashesDenoteHost);
	  return u;
	}

	Url.prototype.parse = function(url, slashesDenoteHost) {
	  var i, l, lowerProto, hec, slashes,
	      rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	      }
	      return this;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    lowerProto = proto.toLowerCase();
	    this.protocol = proto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = auth;
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1) {
	      hostEnd = rest.length;
	    }

	    if (rest[hostEnd - 1] === ':') { hostEnd--; }
	    var host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost(host);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) { continue; }
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    }

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	    }
	  }

	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    rest = rest.slice(0, qm);
	  }
	  if (rest) { this.pathname = rest; }
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '';
	  }

	  return this;
	};

	Url.prototype.parseHost = function(host) {
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) { this.hostname = host; }
	};

	module.exports = urlParse;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.Any = __webpack_require__(14);
	exports.Cc  = __webpack_require__(15);
	exports.Cf  = __webpack_require__(16);
	exports.P   = __webpack_require__(7);
	exports.Z   = __webpack_require__(17);


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports=/[\0-\x1F\x7F-\x9F]/

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// Just a shortcut for bulk export
	'use strict';


	exports.parseLinkLabel       = __webpack_require__(19);
	exports.parseLinkDestination = __webpack_require__(20);
	exports.parseLinkTitle       = __webpack_require__(21);


/***/ },
/* 19 */
/***/ function(module, exports) {

	// Parse link label
	//
	// this function assumes that first character ("[") already matches;
	// returns the end of the label
	//
	'use strict';

	module.exports = function parseLinkLabel(state, start, disableNested) {
	  var level, found, marker, prevPos,
	      labelEnd = -1,
	      max = state.posMax,
	      oldPos = state.pos;

	  state.pos = start + 1;
	  level = 1;

	  while (state.pos < max) {
	    marker = state.src.charCodeAt(state.pos);
	    if (marker === 0x5D /* ] */) {
	      level--;
	      if (level === 0) {
	        found = true;
	        break;
	      }
	    }

	    prevPos = state.pos;
	    state.md.inline.skipToken(state);
	    if (marker === 0x5B /* [ */) {
	      if (prevPos === state.pos - 1) {
	        // increase level if we find text `[`, which is not a part of any token
	        level++;
	      } else if (disableNested) {
	        state.pos = oldPos;
	        return -1;
	      }
	    }
	  }

	  if (found) {
	    labelEnd = state.pos;
	  }

	  // restore old state
	  state.pos = oldPos;

	  return labelEnd;
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// Parse link destination
	//
	'use strict';


	var isSpace     = __webpack_require__(4).isSpace;
	var unescapeAll = __webpack_require__(4).unescapeAll;


	module.exports = function parseLinkDestination(str, pos, max) {
	  var code, level,
	      lines = 0,
	      start = pos,
	      result = {
	        ok: false,
	        pos: 0,
	        lines: 0,
	        str: ''
	      };

	  if (str.charCodeAt(pos) === 0x3C /* < */) {
	    pos++;
	    while (pos < max) {
	      code = str.charCodeAt(pos);
	      if (code === 0x0A /* \n */ || isSpace(code)) { return result; }
	      if (code === 0x3E /* > */) {
	        result.pos = pos + 1;
	        result.str = unescapeAll(str.slice(start + 1, pos));
	        result.ok = true;
	        return result;
	      }
	      if (code === 0x5C /* \ */ && pos + 1 < max) {
	        pos += 2;
	        continue;
	      }

	      pos++;
	    }

	    // no closing '>'
	    return result;
	  }

	  // this should be ... } else { ... branch

	  level = 0;
	  while (pos < max) {
	    code = str.charCodeAt(pos);

	    if (code === 0x20) { break; }

	    // ascii control characters
	    if (code < 0x20 || code === 0x7F) { break; }

	    if (code === 0x5C /* \ */ && pos + 1 < max) {
	      pos += 2;
	      continue;
	    }

	    if (code === 0x28 /* ( */) {
	      level++;
	      if (level > 1) { break; }
	    }

	    if (code === 0x29 /* ) */) {
	      level--;
	      if (level < 0) { break; }
	    }

	    pos++;
	  }

	  if (start === pos) { return result; }

	  result.str = unescapeAll(str.slice(start, pos));
	  result.lines = lines;
	  result.pos = pos;
	  result.ok = true;
	  return result;
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// Parse link title
	//
	'use strict';


	var unescapeAll = __webpack_require__(4).unescapeAll;


	module.exports = function parseLinkTitle(str, pos, max) {
	  var code,
	      marker,
	      lines = 0,
	      start = pos,
	      result = {
	        ok: false,
	        pos: 0,
	        lines: 0,
	        str: ''
	      };

	  if (pos >= max) { return result; }

	  marker = str.charCodeAt(pos);

	  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

	  pos++;

	  // if opening marker is "(", switch it to closing marker ")"
	  if (marker === 0x28) { marker = 0x29; }

	  while (pos < max) {
	    code = str.charCodeAt(pos);
	    if (code === marker) {
	      result.pos = pos + 1;
	      result.lines = lines;
	      result.str = unescapeAll(str.slice(start + 1, pos));
	      result.ok = true;
	      return result;
	    } else if (code === 0x0A) {
	      lines++;
	    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
	      pos++;
	      if (str.charCodeAt(pos) === 0x0A) {
	        lines++;
	      }
	    }

	    pos++;
	  }

	  return result;
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * class Renderer
	 *
	 * Generates HTML from parsed token stream. Each instance has independent
	 * copy of rules. Those can be rewritten with ease. Also, you can add new
	 * rules if you create plugin and adds new token types.
	 **/
	'use strict';


	var assign          = __webpack_require__(4).assign;
	var unescapeAll     = __webpack_require__(4).unescapeAll;
	var escapeHtml      = __webpack_require__(4).escapeHtml;


	////////////////////////////////////////////////////////////////////////////////

	var default_rules = {};


	default_rules.code_inline = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx];

	  return  '<code' + slf.renderAttrs(token) + '>' +
	          escapeHtml(tokens[idx].content) +
	          '</code>';
	};


	default_rules.code_block = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx];

	  return  '<pre' + slf.renderAttrs(token) + '><code>' +
	          escapeHtml(tokens[idx].content) +
	          '</code></pre>\n';
	};


	default_rules.fence = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx],
	      info = token.info ? unescapeAll(token.info).trim() : '',
	      langName = '',
	      highlighted, i, tmpAttrs, tmpToken;

	  if (info) {
	    langName = info.split(/\s+/g)[0];
	  }

	  if (options.highlight) {
	    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
	  } else {
	    highlighted = escapeHtml(token.content);
	  }

	  if (highlighted.indexOf('<pre') === 0) {
	    return highlighted + '\n';
	  }

	  // If language exists, inject class gently, without mudofying original token.
	  // May be, one day we will add .clone() for token and simplify this part, but
	  // now we prefer to keep things local.
	  if (info) {
	    i        = token.attrIndex('class');
	    tmpAttrs = token.attrs ? token.attrs.slice() : [];

	    if (i < 0) {
	      tmpAttrs.push([ 'class', options.langPrefix + langName ]);
	    } else {
	      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
	    }

	    // Fake token just to render attributes
	    tmpToken = {
	      attrs: tmpAttrs
	    };

	    return  '<pre><code' + slf.renderAttrs(tmpToken) + '>'
	          + highlighted
	          + '</code></pre>\n';
	  }


	  return  '<pre><code' + slf.renderAttrs(token) + '>'
	        + highlighted
	        + '</code></pre>\n';
	};


	default_rules.image = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx];

	  // "alt" attr MUST be set, even if empty. Because it's mandatory and
	  // should be placed on proper position for tests.
	  //
	  // Replace content with actual value

	  token.attrs[token.attrIndex('alt')][1] =
	    slf.renderInlineAsText(token.children, options, env);

	  return slf.renderToken(tokens, idx, options);
	};


	default_rules.hardbreak = function (tokens, idx, options /*, env */) {
	  return options.xhtmlOut ? '<br />\n' : '<br>\n';
	};
	default_rules.softbreak = function (tokens, idx, options /*, env */) {
	  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
	};


	default_rules.text = function (tokens, idx /*, options, env */) {
	  return escapeHtml(tokens[idx].content);
	};


	default_rules.html_block = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};
	default_rules.html_inline = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};


	/**
	 * new Renderer()
	 *
	 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
	 **/
	function Renderer() {

	  /**
	   * Renderer#rules -> Object
	   *
	   * Contains render rules for tokens. Can be updated and extended.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * md.renderer.rules.strong_open  = function () { return '<b>'; };
	   * md.renderer.rules.strong_close = function () { return '</b>'; };
	   *
	   * var result = md.renderInline(...);
	   * ```
	   *
	   * Each rule is called as independed static function with fixed signature:
	   *
	   * ```javascript
	   * function my_token_render(tokens, idx, options, env, renderer) {
	   *   // ...
	   *   return renderedHTML;
	   * }
	   * ```
	   *
	   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
	   * for more details and examples.
	   **/
	  this.rules = assign({}, default_rules);
	}


	/**
	 * Renderer.renderAttrs(token) -> String
	 *
	 * Render token attributes to string.
	 **/
	Renderer.prototype.renderAttrs = function renderAttrs(token) {
	  var i, l, result;

	  if (!token.attrs) { return ''; }

	  result = '';

	  for (i = 0, l = token.attrs.length; i < l; i++) {
	    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
	  }

	  return result;
	};


	/**
	 * Renderer.renderToken(tokens, idx, options) -> String
	 * - tokens (Array): list of tokens
	 * - idx (Numbed): token index to render
	 * - options (Object): params of parser instance
	 *
	 * Default token renderer. Can be overriden by custom function
	 * in [[Renderer#rules]].
	 **/
	Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
	  var nextToken,
	      result = '',
	      needLf = false,
	      token = tokens[idx];

	  // Tight list paragraphs
	  if (token.hidden) {
	    return '';
	  }

	  // Insert a newline between hidden paragraph and subsequent opening
	  // block-level tag.
	  //
	  // For example, here we should insert a newline before blockquote:
	  //  - a
	  //    >
	  //
	  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
	    result += '\n';
	  }

	  // Add token name, e.g. `<img`
	  result += (token.nesting === -1 ? '</' : '<') + token.tag;

	  // Encode attributes, e.g. `<img src="foo"`
	  result += this.renderAttrs(token);

	  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
	  if (token.nesting === 0 && options.xhtmlOut) {
	    result += ' /';
	  }

	  // Check if we need to add a newline after this tag
	  if (token.block) {
	    needLf = true;

	    if (token.nesting === 1) {
	      if (idx + 1 < tokens.length) {
	        nextToken = tokens[idx + 1];

	        if (nextToken.type === 'inline' || nextToken.hidden) {
	          // Block-level tag containing an inline tag.
	          //
	          needLf = false;

	        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
	          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
	          //
	          needLf = false;
	        }
	      }
	    }
	  }

	  result += needLf ? '>\n' : '>';

	  return result;
	};


	/**
	 * Renderer.renderInline(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * The same as [[Renderer.render]], but for single token of `inline` type.
	 **/
	Renderer.prototype.renderInline = function (tokens, options, env) {
	  var type,
	      result = '',
	      rules = this.rules;

	  for (var i = 0, len = tokens.length; i < len; i++) {
	    type = tokens[i].type;

	    if (typeof rules[type] !== 'undefined') {
	      result += rules[type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options);
	    }
	  }

	  return result;
	};


	/** internal
	 * Renderer.renderInlineAsText(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Special kludge for image `alt` attributes to conform CommonMark spec.
	 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
	 * instead of simple escaping.
	 **/
	Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
	  var result = '';

	  for (var i = 0, len = tokens.length; i < len; i++) {
	    if (tokens[i].type === 'text') {
	      result += tokens[i].content;
	    } else if (tokens[i].type === 'image') {
	      result += this.renderInlineAsText(tokens[i].children, options, env);
	    }
	  }

	  return result;
	};


	/**
	 * Renderer.render(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Takes token stream and generates HTML. Probably, you will never need to call
	 * this method directly.
	 **/
	Renderer.prototype.render = function (tokens, options, env) {
	  var i, len, type,
	      result = '',
	      rules = this.rules;

	  for (i = 0, len = tokens.length; i < len; i++) {
	    type = tokens[i].type;

	    if (type === 'inline') {
	      result += this.renderInline(tokens[i].children, options, env);
	    } else if (typeof rules[type] !== 'undefined') {
	      result += rules[tokens[i].type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options, env);
	    }
	  }

	  return result;
	};

	module.exports = Renderer;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class Core
	 *
	 * Top-level rules executor. Glues block/inline parsers and does intermediate
	 * transformations.
	 **/
	'use strict';


	var Ruler  = __webpack_require__(24);


	var _rules = [
	  [ 'normalize',      __webpack_require__(25)      ],
	  [ 'block',          __webpack_require__(26)          ],
	  [ 'inline',         __webpack_require__(27)         ],
	  [ 'linkify',        __webpack_require__(28)        ],
	  [ 'replacements',   __webpack_require__(29)   ],
	  [ 'smartquotes',    __webpack_require__(30)    ]
	];


	/**
	 * new Core()
	 **/
	function Core() {
	  /**
	   * Core#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of core rules.
	   **/
	  this.ruler = new Ruler();

	  for (var i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1]);
	  }
	}


	/**
	 * Core.process(state)
	 *
	 * Executes core chain rules.
	 **/
	Core.prototype.process = function (state) {
	  var i, l, rules;

	  rules = this.ruler.getRules('');

	  for (i = 0, l = rules.length; i < l; i++) {
	    rules[i](state);
	  }
	};

	Core.prototype.State = __webpack_require__(31);


	module.exports = Core;


/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * class Ruler
	 *
	 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
	 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
	 *
	 * - keep rules in defined order
	 * - assign the name to each rule
	 * - enable/disable rules
	 * - add/replace rules
	 * - allow assign rules to additional named chains (in the same)
	 * - cacheing lists of active rules
	 *
	 * You will not need use this class directly until write plugins. For simple
	 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
	 * [[MarkdownIt.use]].
	 **/
	'use strict';


	/**
	 * new Ruler()
	 **/
	function Ruler() {
	  // List of added rules. Each element is:
	  //
	  // {
	  //   name: XXX,
	  //   enabled: Boolean,
	  //   fn: Function(),
	  //   alt: [ name2, name3 ]
	  // }
	  //
	  this.__rules__ = [];

	  // Cached rule chains.
	  //
	  // First level - chain name, '' for default.
	  // Second level - diginal anchor for fast filtering by charcodes.
	  //
	  this.__cache__ = null;
	}

	////////////////////////////////////////////////////////////////////////////////
	// Helper methods, should not be used directly


	// Find rule index by name
	//
	Ruler.prototype.__find__ = function (name) {
	  for (var i = 0; i < this.__rules__.length; i++) {
	    if (this.__rules__[i].name === name) {
	      return i;
	    }
	  }
	  return -1;
	};


	// Build rules lookup cache
	//
	Ruler.prototype.__compile__ = function () {
	  var self = this;
	  var chains = [ '' ];

	  // collect unique names
	  self.__rules__.forEach(function (rule) {
	    if (!rule.enabled) { return; }

	    rule.alt.forEach(function (altName) {
	      if (chains.indexOf(altName) < 0) {
	        chains.push(altName);
	      }
	    });
	  });

	  self.__cache__ = {};

	  chains.forEach(function (chain) {
	    self.__cache__[chain] = [];
	    self.__rules__.forEach(function (rule) {
	      if (!rule.enabled) { return; }

	      if (chain && rule.alt.indexOf(chain) < 0) { return; }

	      self.__cache__[chain].push(rule.fn);
	    });
	  });
	};


	/**
	 * Ruler.at(name, fn [, options])
	 * - name (String): rule name to replace.
	 * - fn (Function): new rule function.
	 * - options (Object): new rule options (not mandatory).
	 *
	 * Replace rule by name with new function & options. Throws error if name not
	 * found.
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * Replace existing typorgapher replacement rule with new one:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.at('replacements', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.at = function (name, fn, options) {
	  var index = this.__find__(name);
	  var opt = options || {};

	  if (index === -1) { throw new Error('Parser rule not found: ' + name); }

	  this.__rules__[index].fn = fn;
	  this.__rules__[index].alt = opt.alt || [];
	  this.__cache__ = null;
	};


	/**
	 * Ruler.before(beforeName, ruleName, fn [, options])
	 * - beforeName (String): new rule will be added before this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain before one with given name. See also
	 * [[Ruler.after]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
	  var index = this.__find__(beforeName);
	  var opt = options || {};

	  if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

	  this.__rules__.splice(index, 0, {
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};


	/**
	 * Ruler.after(afterName, ruleName, fn [, options])
	 * - afterName (String): new rule will be added after this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain after one with given name. See also
	 * [[Ruler.before]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.after = function (afterName, ruleName, fn, options) {
	  var index = this.__find__(afterName);
	  var opt = options || {};

	  if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

	  this.__rules__.splice(index + 1, 0, {
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};

	/**
	 * Ruler.push(ruleName, fn [, options])
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Push new rule to the end of chain. See also
	 * [[Ruler.before]], [[Ruler.after]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.push('my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.push = function (ruleName, fn, options) {
	  var opt = options || {};

	  this.__rules__.push({
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};


	/**
	 * Ruler.enable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to enable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.enable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) { list = [ list ]; }

	  var result = [];

	  // Search by name and enable
	  list.forEach(function (name) {
	    var idx = this.__find__(name);

	    if (idx < 0) {
	      if (ignoreInvalid) { return; }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = true;
	    result.push(name);
	  }, this);

	  this.__cache__ = null;
	  return result;
	};


	/**
	 * Ruler.enableOnly(list [, ignoreInvalid])
	 * - list (String|Array): list of rule names to enable (whitelist).
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names, and disable everything else. If any rule name
	 * not found - throw Error. Errors can be disabled by second param.
	 *
	 * See also [[Ruler.disable]], [[Ruler.enable]].
	 **/
	Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) { list = [ list ]; }

	  this.__rules__.forEach(function (rule) { rule.enabled = false; });

	  this.enable(list, ignoreInvalid);
	};


	/**
	 * Ruler.disable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Disable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.disable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) { list = [ list ]; }

	  var result = [];

	  // Search by name and disable
	  list.forEach(function (name) {
	    var idx = this.__find__(name);

	    if (idx < 0) {
	      if (ignoreInvalid) { return; }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = false;
	    result.push(name);
	  }, this);

	  this.__cache__ = null;
	  return result;
	};


	/**
	 * Ruler.getRules(chainName) -> Array
	 *
	 * Return array of active functions (rules) for given chain name. It analyzes
	 * rules configuration, compiles caches if not exists and returns result.
	 *
	 * Default chain name is `''` (empty string). It can't be skipped. That's
	 * done intentionally, to keep signature monomorphic for high speed.
	 **/
	Ruler.prototype.getRules = function (chainName) {
	  if (this.__cache__ === null) {
	    this.__compile__();
	  }

	  // Chain can be empty, if rules disabled. But we still have to return Array.
	  return this.__cache__[chainName] || [];
	};

	module.exports = Ruler;


/***/ },
/* 25 */
/***/ function(module, exports) {

	// Normalize input string

	'use strict';


	var NEWLINES_RE  = /\r[\n\u0085]?|[\u2424\u2028\u0085]/g;
	var NULL_RE      = /\u0000/g;


	module.exports = function inline(state) {
	  var str;

	  // Normalize newlines
	  str = state.src.replace(NEWLINES_RE, '\n');

	  // Replace NULL characters
	  str = str.replace(NULL_RE, '\uFFFD');

	  state.src = str;
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';


	module.exports = function block(state) {
	  var token;

	  if (state.inlineMode) {
	    token          = new state.Token('inline', '', 0);
	    token.content  = state.src;
	    token.map      = [ 0, 1 ];
	    token.children = [];
	    state.tokens.push(token);
	  } else {
	    state.md.block.parse(state.src, state.md, state.env, state.tokens);
	  }
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function inline(state) {
	  var tokens = state.tokens, tok, i, l;

	  // Parse inlines
	  for (i = 0, l = tokens.length; i < l; i++) {
	    tok = tokens[i];
	    if (tok.type === 'inline') {
	      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
	    }
	  }
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// Replace link-like texts with link nodes.
	//
	// Currently restricted by `md.validateLink()` to http/https/ftp
	//
	'use strict';


	var arrayReplaceAt = __webpack_require__(4).arrayReplaceAt;


	function isLinkOpen(str) {
	  return /^<a[>\s]/i.test(str);
	}
	function isLinkClose(str) {
	  return /^<\/a\s*>/i.test(str);
	}


	module.exports = function linkify(state) {
	  var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos,
	      level, htmlLinkLevel, url, fullUrl, urlText,
	      blockTokens = state.tokens,
	      links;

	  if (!state.md.options.linkify) { return; }

	  for (j = 0, l = blockTokens.length; j < l; j++) {
	    if (blockTokens[j].type !== 'inline' ||
	        !state.md.linkify.pretest(blockTokens[j].content)) {
	      continue;
	    }

	    tokens = blockTokens[j].children;

	    htmlLinkLevel = 0;

	    // We scan from the end, to keep position when new tags added.
	    // Use reversed logic in links start/end match
	    for (i = tokens.length - 1; i >= 0; i--) {
	      currentToken = tokens[i];

	      // Skip content of markdown links
	      if (currentToken.type === 'link_close') {
	        i--;
	        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
	          i--;
	        }
	        continue;
	      }

	      // Skip content of html tag links
	      if (currentToken.type === 'html_inline') {
	        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
	          htmlLinkLevel--;
	        }
	        if (isLinkClose(currentToken.content)) {
	          htmlLinkLevel++;
	        }
	      }
	      if (htmlLinkLevel > 0) { continue; }

	      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

	        text = currentToken.content;
	        links = state.md.linkify.match(text);

	        // Now split string to nodes
	        nodes = [];
	        level = currentToken.level;
	        lastPos = 0;

	        for (ln = 0; ln < links.length; ln++) {

	          url = links[ln].url;
	          fullUrl = state.md.normalizeLink(url);
	          if (!state.md.validateLink(fullUrl)) { continue; }

	          urlText = links[ln].text;

	          // Linkifier might send raw hostnames like "example.com", where url
	          // starts with domain name. So we prepend http:// in those cases,
	          // and remove it afterwards.
	          //
	          if (!links[ln].schema) {
	            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
	          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
	            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
	          } else {
	            urlText = state.md.normalizeLinkText(urlText);
	          }

	          pos = links[ln].index;

	          if (pos > lastPos) {
	            token         = new state.Token('text', '', 0);
	            token.content = text.slice(lastPos, pos);
	            token.level   = level;
	            nodes.push(token);
	          }

	          token         = new state.Token('link_open', 'a', 1);
	          token.attrs   = [ [ 'href', fullUrl ] ];
	          token.level   = level++;
	          token.markup  = 'linkify';
	          token.info    = 'auto';
	          nodes.push(token);

	          token         = new state.Token('text', '', 0);
	          token.content = urlText;
	          token.level   = level;
	          nodes.push(token);

	          token         = new state.Token('link_close', 'a', -1);
	          token.level   = --level;
	          token.markup  = 'linkify';
	          token.info    = 'auto';
	          nodes.push(token);

	          lastPos = links[ln].lastIndex;
	        }
	        if (lastPos < text.length) {
	          token         = new state.Token('text', '', 0);
	          token.content = text.slice(lastPos);
	          token.level   = level;
	          nodes.push(token);
	        }

	        // replace current node
	        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
	      }
	    }
	  }
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	// Simple typographyc replacements
	//
	// (c) (C) → ©
	// (tm) (TM) → ™
	// (r) (R) → ®
	// +- → ±
	// (p) (P) -> §
	// ... → … (also ?.... → ?.., !.... → !..)
	// ???????? → ???, !!!!! → !!!, `,,` → `,`
	// -- → &ndash;, --- → &mdash;
	//
	'use strict';

	// TODO:
	// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
	// - miltiplication 2 x 4 -> 2 × 4

	var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

	// Workaround for phantomjs - need regex without /g flag,
	// or root check will fail every second time
	var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

	var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
	var SCOPED_ABBR = {
	  c: '©',
	  r: '®',
	  p: '§',
	  tm: '™'
	};

	function replaceFn(match, name) {
	  return SCOPED_ABBR[name.toLowerCase()];
	}

	function replace_scoped(inlineTokens) {
	  var i, token, inside_autolink = 0;

	  for (i = inlineTokens.length - 1; i >= 0; i--) {
	    token = inlineTokens[i];

	    if (token.type === 'text' && !inside_autolink) {
	      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
	    }

	    if (token.type === 'link_open' && token.info === 'auto') {
	      inside_autolink--;
	    }

	    if (token.type === 'link_close' && token.info === 'auto') {
	      inside_autolink++;
	    }
	  }
	}

	function replace_rare(inlineTokens) {
	  var i, token, inside_autolink = 0;

	  for (i = inlineTokens.length - 1; i >= 0; i--) {
	    token = inlineTokens[i];

	    if (token.type === 'text' && !inside_autolink) {
	      if (RARE_RE.test(token.content)) {
	        token.content = token.content
	                    .replace(/\+-/g, '±')
	                    // .., ..., ....... -> …
	                    // but ?..... & !..... -> ?.. & !..
	                    .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
	                    .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
	                    // em-dash
	                    .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
	                    // en-dash
	                    .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
	                    .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
	      }
	    }

	    if (token.type === 'link_open' && token.info === 'auto') {
	      inside_autolink--;
	    }

	    if (token.type === 'link_close' && token.info === 'auto') {
	      inside_autolink++;
	    }
	  }
	}


	module.exports = function replace(state) {
	  var blkIdx;

	  if (!state.md.options.typographer) { return; }

	  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

	    if (state.tokens[blkIdx].type !== 'inline') { continue; }

	    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
	      replace_scoped(state.tokens[blkIdx].children);
	    }

	    if (RARE_RE.test(state.tokens[blkIdx].content)) {
	      replace_rare(state.tokens[blkIdx].children);
	    }

	  }
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// Convert straight quotation marks to typographic ones
	//
	'use strict';


	var isWhiteSpace   = __webpack_require__(4).isWhiteSpace;
	var isPunctChar    = __webpack_require__(4).isPunctChar;
	var isMdAsciiPunct = __webpack_require__(4).isMdAsciiPunct;

	var QUOTE_TEST_RE = /['"]/;
	var QUOTE_RE = /['"]/g;
	var APOSTROPHE = '\u2019'; /* ’ */


	function replaceAt(str, index, ch) {
	  return str.substr(0, index) + ch + str.substr(index + 1);
	}

	function process_inlines(tokens, state) {
	  var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar,
	      isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace,
	      canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

	  stack = [];

	  for (i = 0; i < tokens.length; i++) {
	    token = tokens[i];

	    thisLevel = tokens[i].level;

	    for (j = stack.length - 1; j >= 0; j--) {
	      if (stack[j].level <= thisLevel) { break; }
	    }
	    stack.length = j + 1;

	    if (token.type !== 'text') { continue; }

	    text = token.content;
	    pos = 0;
	    max = text.length;

	    /*eslint no-labels:0,block-scoped-var:0*/
	    OUTER:
	    while (pos < max) {
	      QUOTE_RE.lastIndex = pos;
	      t = QUOTE_RE.exec(text);
	      if (!t) { break; }

	      canOpen = canClose = true;
	      pos = t.index + 1;
	      isSingle = (t[0] === "'");

	      // Find previous character,
	      // default to space if it's the beginning of the line
	      //
	      lastChar = 0x20;

	      if (t.index - 1 >= 0) {
	        lastChar = text.charCodeAt(t.index - 1);
	      } else {
	        for (j = i - 1; j >= 0; j--) {
	          if (tokens[j].type !== 'text') { continue; }

	          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
	          break;
	        }
	      }

	      // Find next character,
	      // default to space if it's the end of the line
	      //
	      nextChar = 0x20;

	      if (pos < max) {
	        nextChar = text.charCodeAt(pos);
	      } else {
	        for (j = i + 1; j < tokens.length; j++) {
	          if (tokens[j].type !== 'text') { continue; }

	          nextChar = tokens[j].content.charCodeAt(0);
	          break;
	        }
	      }

	      isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	      isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

	      isLastWhiteSpace = isWhiteSpace(lastChar);
	      isNextWhiteSpace = isWhiteSpace(nextChar);

	      if (isNextWhiteSpace) {
	        canOpen = false;
	      } else if (isNextPunctChar) {
	        if (!(isLastWhiteSpace || isLastPunctChar)) {
	          canOpen = false;
	        }
	      }

	      if (isLastWhiteSpace) {
	        canClose = false;
	      } else if (isLastPunctChar) {
	        if (!(isNextWhiteSpace || isNextPunctChar)) {
	          canClose = false;
	        }
	      }

	      if (nextChar === 0x22 /* " */ && t[0] === '"') {
	        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
	          // special case: 1"" - count first quote as an inch
	          canClose = canOpen = false;
	        }
	      }

	      if (canOpen && canClose) {
	        // treat this as the middle of the word
	        canOpen = false;
	        canClose = isNextPunctChar;
	      }

	      if (!canOpen && !canClose) {
	        // middle of word
	        if (isSingle) {
	          token.content = replaceAt(token.content, t.index, APOSTROPHE);
	        }
	        continue;
	      }

	      if (canClose) {
	        // this could be a closing quote, rewind the stack to get a match
	        for (j = stack.length - 1; j >= 0; j--) {
	          item = stack[j];
	          if (stack[j].level < thisLevel) { break; }
	          if (item.single === isSingle && stack[j].level === thisLevel) {
	            item = stack[j];

	            if (isSingle) {
	              openQuote = state.md.options.quotes[2];
	              closeQuote = state.md.options.quotes[3];
	            } else {
	              openQuote = state.md.options.quotes[0];
	              closeQuote = state.md.options.quotes[1];
	            }

	            // replace token.content *before* tokens[item.token].content,
	            // because, if they are pointing at the same token, replaceAt
	            // could mess up indices when quote length != 1
	            token.content = replaceAt(token.content, t.index, closeQuote);
	            tokens[item.token].content = replaceAt(
	              tokens[item.token].content, item.pos, openQuote);

	            pos += closeQuote.length - 1;
	            if (item.token === i) { pos += openQuote.length - 1; }

	            text = token.content;
	            max = text.length;

	            stack.length = j;
	            continue OUTER;
	          }
	        }
	      }

	      if (canOpen) {
	        stack.push({
	          token: i,
	          pos: t.index,
	          single: isSingle,
	          level: thisLevel
	        });
	      } else if (canClose && isSingle) {
	        token.content = replaceAt(token.content, t.index, APOSTROPHE);
	      }
	    }
	  }
	}


	module.exports = function smartquotes(state) {
	  /*eslint max-depth:0*/
	  var blkIdx;

	  if (!state.md.options.typographer) { return; }

	  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

	    if (state.tokens[blkIdx].type !== 'inline' ||
	        !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
	      continue;
	    }

	    process_inlines(state.tokens[blkIdx].children, state);
	  }
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// Core state object
	//
	'use strict';

	var Token = __webpack_require__(32);


	function StateCore(src, md, env) {
	  this.src = src;
	  this.env = env;
	  this.tokens = [];
	  this.inlineMode = false;
	  this.md = md; // link to parser instance
	}

	// re-export Token class to use in core rules
	StateCore.prototype.Token = Token;


	module.exports = StateCore;


/***/ },
/* 32 */
/***/ function(module, exports) {

	// Token class

	'use strict';


	/**
	 * class Token
	 **/

	/**
	 * new Token(type, tag, nesting)
	 *
	 * Create new token and fill passed properties.
	 **/
	function Token(type, tag, nesting) {
	  /**
	   * Token#type -> String
	   *
	   * Type of the token (string, e.g. "paragraph_open")
	   **/
	  this.type     = type;

	  /**
	   * Token#tag -> String
	   *
	   * html tag name, e.g. "p"
	   **/
	  this.tag      = tag;

	  /**
	   * Token#attrs -> Array
	   *
	   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
	   **/
	  this.attrs    = null;

	  /**
	   * Token#map -> Array
	   *
	   * Source map info. Format: `[ line_begin, line_end ]`
	   **/
	  this.map      = null;

	  /**
	   * Token#nesting -> Number
	   *
	   * Level change (number in {-1, 0, 1} set), where:
	   *
	   * -  `1` means the tag is opening
	   * -  `0` means the tag is self-closing
	   * - `-1` means the tag is closing
	   **/
	  this.nesting  = nesting;

	  /**
	   * Token#level -> Number
	   *
	   * nesting level, the same as `state.level`
	   **/
	  this.level    = 0;

	  /**
	   * Token#children -> Array
	   *
	   * An array of child nodes (inline and img tokens)
	   **/
	  this.children = null;

	  /**
	   * Token#content -> String
	   *
	   * In a case of self-closing tag (code, html, fence, etc.),
	   * it has contents of this tag.
	   **/
	  this.content  = '';

	  /**
	   * Token#markup -> String
	   *
	   * '*' or '_' for emphasis, fence string for fence, etc.
	   **/
	  this.markup   = '';

	  /**
	   * Token#info -> String
	   *
	   * fence infostring
	   **/
	  this.info     = '';

	  /**
	   * Token#meta -> Object
	   *
	   * A place for plugins to store an arbitrary data
	   **/
	  this.meta     = null;

	  /**
	   * Token#block -> Boolean
	   *
	   * True for block-level tokens, false for inline tokens.
	   * Used in renderer to calculate line breaks
	   **/
	  this.block    = false;

	  /**
	   * Token#hidden -> Boolean
	   *
	   * If it's true, ignore this element when rendering. Used for tight lists
	   * to hide paragraphs.
	   **/
	  this.hidden   = false;
	}


	/**
	 * Token.attrIndex(name) -> Number
	 *
	 * Search attribute index by name.
	 **/
	Token.prototype.attrIndex = function attrIndex(name) {
	  var attrs, i, len;

	  if (!this.attrs) { return -1; }

	  attrs = this.attrs;

	  for (i = 0, len = attrs.length; i < len; i++) {
	    if (attrs[i][0] === name) { return i; }
	  }
	  return -1;
	};


	/**
	 * Token.attrPush(attrData)
	 *
	 * Add `[ name, value ]` attribute to list. Init attrs if necessary
	 **/
	Token.prototype.attrPush = function attrPush(attrData) {
	  if (this.attrs) {
	    this.attrs.push(attrData);
	  } else {
	    this.attrs = [ attrData ];
	  }
	};


	/**
	 * Token.attrSet(name, value)
	 *
	 * Set `name` attribute to `value`. Override old value if exists.
	 **/
	Token.prototype.attrSet = function attrSet(name, value) {
	  var idx = this.attrIndex(name),
	      attrData = [ name, value ];

	  if (idx < 0) {
	    this.attrPush(attrData);
	  } else {
	    this.attrs[idx] = attrData;
	  }
	};


	/**
	 * Token.attrGet(name)
	 *
	 * Get the value of attribute `name`, or null if it does not exist.
	 **/
	Token.prototype.attrGet = function attrGet(name) {
	  var idx = this.attrIndex(name), value = null;
	  if (idx >= 0) {
	    value = this.attrs[idx][1];
	  }
	  return value;
	};


	/**
	 * Token.attrJoin(name, value)
	 *
	 * Join value to existing attribute via space. Or create new attribute if not
	 * exists. Useful to operate with token classes.
	 **/
	Token.prototype.attrJoin = function attrJoin(name, value) {
	  var idx = this.attrIndex(name);

	  if (idx < 0) {
	    this.attrPush([ name, value ]);
	  } else {
	    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
	  }
	};


	module.exports = Token;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class ParserBlock
	 *
	 * Block-level tokenizer.
	 **/
	'use strict';


	var Ruler           = __webpack_require__(24);


	var _rules = [
	  // First 2 params - rule name & source. Secondary array - list of rules,
	  // which can be terminated by this one.
	  [ 'table',      __webpack_require__(34),      [ 'paragraph', 'reference' ] ],
	  [ 'code',       __webpack_require__(35) ],
	  [ 'fence',      __webpack_require__(36),      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
	  [ 'blockquote', __webpack_require__(37), [ 'paragraph', 'reference', 'list' ] ],
	  [ 'hr',         __webpack_require__(38),         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
	  [ 'list',       __webpack_require__(39),       [ 'paragraph', 'reference', 'blockquote' ] ],
	  [ 'reference',  __webpack_require__(40) ],
	  [ 'heading',    __webpack_require__(41),    [ 'paragraph', 'reference', 'blockquote' ] ],
	  [ 'lheading',   __webpack_require__(42) ],
	  [ 'html_block', __webpack_require__(43), [ 'paragraph', 'reference', 'blockquote' ] ],
	  [ 'paragraph',  __webpack_require__(46) ]
	];


	/**
	 * new ParserBlock()
	 **/
	function ParserBlock() {
	  /**
	   * ParserBlock#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of block rules.
	   **/
	  this.ruler = new Ruler();

	  for (var i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
	  }
	}


	// Generate tokens for input range
	//
	ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
	  var ok, i,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      line = startLine,
	      hasEmptyLines = false,
	      maxNesting = state.md.options.maxNesting;

	  while (line < endLine) {
	    state.line = line = state.skipEmptyLines(line);
	    if (line >= endLine) { break; }

	    // Termination condition for nested calls.
	    // Nested calls currently used for blockquotes & lists
	    if (state.sCount[line] < state.blkIndent) { break; }

	    // If nesting level exceeded - skip tail to the end. That's not ordinary
	    // situation and we should not care about content.
	    if (state.level >= maxNesting) {
	      state.line = endLine;
	      break;
	    }

	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.line`
	    // - update `state.tokens`
	    // - return true

	    for (i = 0; i < len; i++) {
	      ok = rules[i](state, line, endLine, false);
	      if (ok) { break; }
	    }

	    // set state.tight iff we had an empty line before current tag
	    // i.e. latest empty line should not count
	    state.tight = !hasEmptyLines;

	    // paragraph might "eat" one newline after it in nested lists
	    if (state.isEmpty(state.line - 1)) {
	      hasEmptyLines = true;
	    }

	    line = state.line;

	    if (line < endLine && state.isEmpty(line)) {
	      hasEmptyLines = true;
	      line++;
	      state.line = line;
	    }
	  }
	};


	/**
	 * ParserBlock.parse(str, md, env, outTokens)
	 *
	 * Process input string and push block tokens into `outTokens`
	 **/
	ParserBlock.prototype.parse = function (src, md, env, outTokens) {
	  var state;

	  if (!src) { return; }

	  state = new this.State(src, md, env, outTokens);

	  this.tokenize(state, state.line, state.lineMax);
	};


	ParserBlock.prototype.State = __webpack_require__(47);


	module.exports = ParserBlock;


/***/ },
/* 34 */
/***/ function(module, exports) {

	// GFM table, non-standard

	'use strict';


	function getLine(state, line) {
	  var pos = state.bMarks[line] + state.blkIndent,
	      max = state.eMarks[line];

	  return state.src.substr(pos, max - pos);
	}

	function escapedSplit(str) {
	  var result = [],
	      pos = 0,
	      max = str.length,
	      ch,
	      escapes = 0,
	      lastPos = 0,
	      backTicked = false,
	      lastBackTick = 0;

	  ch  = str.charCodeAt(pos);

	  while (pos < max) {
	    if (ch === 0x60/* ` */ && (escapes % 2 === 0)) {
	      backTicked = !backTicked;
	      lastBackTick = pos;
	    } else if (ch === 0x7c/* | */ && (escapes % 2 === 0) && !backTicked) {
	      result.push(str.substring(lastPos, pos));
	      lastPos = pos + 1;
	    } else if (ch === 0x5c/* \ */) {
	      escapes++;
	    } else {
	      escapes = 0;
	    }

	    pos++;

	    // If there was an un-closed backtick, go back to just after
	    // the last backtick, but as if it was a normal character
	    if (pos === max && backTicked) {
	      backTicked = false;
	      pos = lastBackTick + 1;
	    }

	    ch = str.charCodeAt(pos);
	  }

	  result.push(str.substring(lastPos));

	  return result;
	}


	module.exports = function table(state, startLine, endLine, silent) {
	  var ch, lineText, pos, i, nextLine, columns, columnCount, token,
	      aligns, t, tableLines, tbodyLines;

	  // should have at least three lines
	  if (startLine + 2 > endLine) { return false; }

	  nextLine = startLine + 1;

	  if (state.sCount[nextLine] < state.blkIndent) { return false; }

	  // first character of the second line should be '|' or '-'

	  pos = state.bMarks[nextLine] + state.tShift[nextLine];
	  if (pos >= state.eMarks[nextLine]) { return false; }

	  ch = state.src.charCodeAt(pos);
	  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

	  lineText = getLine(state, startLine + 1);
	  if (!/^[-:| ]+$/.test(lineText)) { return false; }

	  columns = lineText.split('|');
	  aligns = [];
	  for (i = 0; i < columns.length; i++) {
	    t = columns[i].trim();
	    if (!t) {
	      // allow empty columns before and after table, but not in between columns;
	      // e.g. allow ` |---| `, disallow ` ---||--- `
	      if (i === 0 || i === columns.length - 1) {
	        continue;
	      } else {
	        return false;
	      }
	    }

	    if (!/^:?-+:?$/.test(t)) { return false; }
	    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
	      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
	    } else if (t.charCodeAt(0) === 0x3A/* : */) {
	      aligns.push('left');
	    } else {
	      aligns.push('');
	    }
	  }

	  lineText = getLine(state, startLine).trim();
	  if (lineText.indexOf('|') === -1) { return false; }
	  columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

	  // header row will define an amount of columns in the entire table,
	  // and align row shouldn't be smaller than that (the rest of the rows can)
	  columnCount = columns.length;
	  if (columnCount > aligns.length) { return false; }

	  if (silent) { return true; }

	  token     = state.push('table_open', 'table', 1);
	  token.map = tableLines = [ startLine, 0 ];

	  token     = state.push('thead_open', 'thead', 1);
	  token.map = [ startLine, startLine + 1 ];

	  token     = state.push('tr_open', 'tr', 1);
	  token.map = [ startLine, startLine + 1 ];

	  for (i = 0; i < columns.length; i++) {
	    token          = state.push('th_open', 'th', 1);
	    token.map      = [ startLine, startLine + 1 ];
	    if (aligns[i]) {
	      token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
	    }

	    token          = state.push('inline', '', 0);
	    token.content  = columns[i].trim();
	    token.map      = [ startLine, startLine + 1 ];
	    token.children = [];

	    token          = state.push('th_close', 'th', -1);
	  }

	  token     = state.push('tr_close', 'tr', -1);
	  token     = state.push('thead_close', 'thead', -1);

	  token     = state.push('tbody_open', 'tbody', 1);
	  token.map = tbodyLines = [ startLine + 2, 0 ];

	  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
	    if (state.sCount[nextLine] < state.blkIndent) { break; }

	    lineText = getLine(state, nextLine);
	    if (lineText.indexOf('|') === -1) { break; }

	    // keep spaces at beginning of line to indicate an empty first cell, but
	    // strip trailing whitespace
	    columns = escapedSplit(lineText.replace(/^\||\|\s*$/g, ''));

	    token = state.push('tr_open', 'tr', 1);
	    for (i = 0; i < columnCount; i++) {
	      token          = state.push('td_open', 'td', 1);
	      if (aligns[i]) {
	        token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
	      }

	      token          = state.push('inline', '', 0);
	      token.content  = columns[i] ? columns[i].trim() : '';
	      token.children = [];

	      token          = state.push('td_close', 'td', -1);
	    }
	    token = state.push('tr_close', 'tr', -1);
	  }
	  token = state.push('tbody_close', 'tbody', -1);
	  token = state.push('table_close', 'table', -1);

	  tableLines[1] = tbodyLines[1] = nextLine;
	  state.line = nextLine;
	  return true;
	};


/***/ },
/* 35 */
/***/ function(module, exports) {

	// Code block (4 spaces padded)

	'use strict';


	module.exports = function code(state, startLine, endLine/*, silent*/) {
	  var nextLine, last, token;

	  if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

	  last = nextLine = startLine + 1;

	  while (nextLine < endLine) {
	    if (state.isEmpty(nextLine)) {
	      nextLine++;
	      continue;
	    }

	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      nextLine++;
	      last = nextLine;
	      continue;
	    }
	    break;
	  }

	  state.line = last;

	  token         = state.push('code_block', 'code', 0);
	  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
	  token.map     = [ startLine, state.line ];

	  return true;
	};


/***/ },
/* 36 */
/***/ function(module, exports) {

	// fences (``` lang, ~~~ lang)

	'use strict';


	module.exports = function fence(state, startLine, endLine, silent) {
	  var marker, len, params, nextLine, mem, token, markup,
	      haveEndMarker = false,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  if (pos + 3 > max) { return false; }

	  marker = state.src.charCodeAt(pos);

	  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
	    return false;
	  }

	  // scan marker length
	  mem = pos;
	  pos = state.skipChars(pos, marker);

	  len = pos - mem;

	  if (len < 3) { return false; }

	  markup = state.src.slice(mem, pos);
	  params = state.src.slice(pos, max);

	  if (params.indexOf('`') >= 0) { return false; }

	  // Since start is found, we can report success here in validation mode
	  if (silent) { return true; }

	  // search end of block
	  nextLine = startLine;

	  for (;;) {
	    nextLine++;
	    if (nextLine >= endLine) {
	      // unclosed block should be autoclosed by end of document.
	      // also block seems to be autoclosed by end of parent
	      break;
	    }

	    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];

	    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
	      // non-empty line with negative indent should stop the list:
	      // - ```
	      //  test
	      break;
	    }

	    if (state.src.charCodeAt(pos) !== marker) { continue; }

	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      // closing fence should be indented less than 4 spaces
	      continue;
	    }

	    pos = state.skipChars(pos, marker);

	    // closing code fence must be at least as long as the opening one
	    if (pos - mem < len) { continue; }

	    // make sure tail has spaces only
	    pos = state.skipSpaces(pos);

	    if (pos < max) { continue; }

	    haveEndMarker = true;
	    // found!
	    break;
	  }

	  // If a fence has heading spaces, they should be removed from its inner block
	  len = state.sCount[startLine];

	  state.line = nextLine + (haveEndMarker ? 1 : 0);

	  token         = state.push('fence', 'code', 0);
	  token.info    = params;
	  token.content = state.getLines(startLine + 1, nextLine, len, true);
	  token.markup  = markup;
	  token.map     = [ startLine, state.line ];

	  return true;
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// Block quotes

	'use strict';

	var isSpace = __webpack_require__(4).isSpace;


	module.exports = function blockquote(state, startLine, endLine, silent) {
	  var adjustTab,
	      ch,
	      i,
	      initial,
	      l,
	      lastLineEmpty,
	      lines,
	      nextLine,
	      offset,
	      oldBMarks,
	      oldBSCount,
	      oldIndent,
	      oldParentType,
	      oldSCount,
	      oldTShift,
	      spaceAfterMarker,
	      terminate,
	      terminatorRules,
	      token,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  // check the block quote marker
	  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

	  // we know that it's going to be a valid blockquote,
	  // so no point trying to find the end of it in silent mode
	  if (silent) { return true; }

	  oldIndent = state.blkIndent;
	  state.blkIndent = 0;

	  // skip spaces after ">" and re-calculate offset
	  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

	  // skip one optional space after '>'
	  if (state.src.charCodeAt(pos) === 0x20 /* space */) {
	    // ' >   test '
	    //     ^ -- position start of line here:
	    pos++;
	    initial++;
	    offset++;
	    adjustTab = false;
	    spaceAfterMarker = true;
	  } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
	    spaceAfterMarker = true;

	    if ((state.bsCount[startLine] + offset) % 4 === 3) {
	      // '  >\t  test '
	      //       ^ -- position start of line here (tab has width===1)
	      pos++;
	      initial++;
	      offset++;
	      adjustTab = false;
	    } else {
	      // ' >\t  test '
	      //    ^ -- position start of line here + shift bsCount slightly
	      //         to make extra space appear
	      adjustTab = true;
	    }
	  } else {
	    spaceAfterMarker = false;
	  }

	  oldBMarks = [ state.bMarks[startLine] ];
	  state.bMarks[startLine] = pos;

	  while (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (isSpace(ch)) {
	      if (ch === 0x09) {
	        offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4;
	      } else {
	        offset++;
	      }
	    } else {
	      break;
	    }

	    pos++;
	  }

	  oldBSCount = [ state.bsCount[startLine] ];
	  state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0);

	  lastLineEmpty = pos >= max;

	  oldSCount = [ state.sCount[startLine] ];
	  state.sCount[startLine] = offset - initial;

	  oldTShift = [ state.tShift[startLine] ];
	  state.tShift[startLine] = pos - state.bMarks[startLine];

	  terminatorRules = state.md.block.ruler.getRules('blockquote');

	  oldParentType = state.parentType;
	  state.parentType = 'blockquote';

	  // Search the end of the block
	  //
	  // Block ends with either:
	  //  1. an empty line outside:
	  //     ```
	  //     > test
	  //
	  //     ```
	  //  2. an empty line inside:
	  //     ```
	  //     >
	  //     test
	  //     ```
	  //  3. another tag
	  //     ```
	  //     > test
	  //      - - -
	  //     ```
	  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
	    if (state.sCount[nextLine] < oldIndent) { break; }

	    pos = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];

	    if (pos >= max) {
	      // Case 1: line is not inside the blockquote, and this line is empty.
	      break;
	    }

	    if (state.src.charCodeAt(pos++) === 0x3E/* > */) {
	      // This line is inside the blockquote.

	      // skip spaces after ">" and re-calculate offset
	      initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

	      // skip one optional space after '>'
	      if (state.src.charCodeAt(pos) === 0x20 /* space */) {
	        // ' >   test '
	        //     ^ -- position start of line here:
	        pos++;
	        initial++;
	        offset++;
	        adjustTab = false;
	        spaceAfterMarker = true;
	      } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
	        spaceAfterMarker = true;

	        if ((state.bsCount[nextLine] + offset) % 4 === 3) {
	          // '  >\t  test '
	          //       ^ -- position start of line here (tab has width===1)
	          pos++;
	          initial++;
	          offset++;
	          adjustTab = false;
	        } else {
	          // ' >\t  test '
	          //    ^ -- position start of line here + shift bsCount slightly
	          //         to make extra space appear
	          adjustTab = true;
	        }
	      } else {
	        spaceAfterMarker = false;
	      }

	      oldBMarks.push(state.bMarks[nextLine]);
	      state.bMarks[nextLine] = pos;

	      while (pos < max) {
	        ch = state.src.charCodeAt(pos);

	        if (isSpace(ch)) {
	          if (ch === 0x09) {
	            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
	          } else {
	            offset++;
	          }
	        } else {
	          break;
	        }

	        pos++;
	      }

	      lastLineEmpty = pos >= max;

	      oldBSCount.push(state.bsCount[nextLine]);
	      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

	      oldSCount.push(state.sCount[nextLine]);
	      state.sCount[nextLine] = offset - initial;

	      oldTShift.push(state.tShift[nextLine]);
	      state.tShift[nextLine] = pos - state.bMarks[nextLine];
	      continue;
	    }

	    // Case 2: line is not inside the blockquote, and the last line was empty.
	    if (lastLineEmpty) { break; }

	    // Case 3: another tag found.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) { break; }

	    oldBMarks.push(state.bMarks[nextLine]);
	    oldBSCount.push(state.bsCount[nextLine]);
	    oldTShift.push(state.tShift[nextLine]);
	    oldSCount.push(state.sCount[nextLine]);

	    // A negative indentation means that this is a paragraph continuation
	    //
	    state.sCount[nextLine] = -1;
	  }

	  token        = state.push('blockquote_open', 'blockquote', 1);
	  token.markup = '>';
	  token.map    = lines = [ startLine, 0 ];

	  state.md.block.tokenize(state, startLine, nextLine);

	  token        = state.push('blockquote_close', 'blockquote', -1);
	  token.markup = '>';

	  state.parentType = oldParentType;
	  lines[1] = state.line;

	  // Restore original tShift; this might not be necessary since the parser
	  // has already been here, but just to make sure we can do that.
	  for (i = 0; i < oldTShift.length; i++) {
	    state.bMarks[i + startLine] = oldBMarks[i];
	    state.tShift[i + startLine] = oldTShift[i];
	    state.sCount[i + startLine] = oldSCount[i];
	    state.bsCount[i + startLine] = oldBSCount[i];
	  }
	  state.blkIndent = oldIndent;

	  return true;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Horizontal rule

	'use strict';

	var isSpace = __webpack_require__(4).isSpace;


	module.exports = function hr(state, startLine, endLine, silent) {
	  var marker, cnt, ch, token,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  marker = state.src.charCodeAt(pos++);

	  // Check hr marker
	  if (marker !== 0x2A/* * */ &&
	      marker !== 0x2D/* - */ &&
	      marker !== 0x5F/* _ */) {
	    return false;
	  }

	  // markers can be mixed with spaces, but there should be at least 3 of them

	  cnt = 1;
	  while (pos < max) {
	    ch = state.src.charCodeAt(pos++);
	    if (ch !== marker && !isSpace(ch)) { return false; }
	    if (ch === marker) { cnt++; }
	  }

	  if (cnt < 3) { return false; }

	  if (silent) { return true; }

	  state.line = startLine + 1;

	  token        = state.push('hr', 'hr', 0);
	  token.map    = [ startLine, state.line ];
	  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

	  return true;
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// Lists

	'use strict';

	var isSpace = __webpack_require__(4).isSpace;


	// Search `[-+*][\n ]`, returns next pos arter marker on success
	// or -1 on fail.
	function skipBulletListMarker(state, startLine) {
	  var marker, pos, max, ch;

	  pos = state.bMarks[startLine] + state.tShift[startLine];
	  max = state.eMarks[startLine];

	  marker = state.src.charCodeAt(pos++);
	  // Check bullet
	  if (marker !== 0x2A/* * */ &&
	      marker !== 0x2D/* - */ &&
	      marker !== 0x2B/* + */) {
	    return -1;
	  }

	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (!isSpace(ch)) {
	      // " -test " - is not a list item
	      return -1;
	    }
	  }

	  return pos;
	}

	// Search `\d+[.)][\n ]`, returns next pos arter marker on success
	// or -1 on fail.
	function skipOrderedListMarker(state, startLine) {
	  var ch,
	      start = state.bMarks[startLine] + state.tShift[startLine],
	      pos = start,
	      max = state.eMarks[startLine];

	  // List marker should have at least 2 chars (digit + dot)
	  if (pos + 1 >= max) { return -1; }

	  ch = state.src.charCodeAt(pos++);

	  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

	  for (;;) {
	    // EOL -> fail
	    if (pos >= max) { return -1; }

	    ch = state.src.charCodeAt(pos++);

	    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {

	      // List marker should have no more than 9 digits
	      // (prevents integer overflow in browsers)
	      if (pos - start >= 10) { return -1; }

	      continue;
	    }

	    // found valid marker
	    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
	      break;
	    }

	    return -1;
	  }


	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (!isSpace(ch)) {
	      // " 1.test " - is not a list item
	      return -1;
	    }
	  }
	  return pos;
	}

	function markTightParagraphs(state, idx) {
	  var i, l,
	      level = state.level + 2;

	  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
	    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
	      state.tokens[i + 2].hidden = true;
	      state.tokens[i].hidden = true;
	      i += 2;
	    }
	  }
	}


	module.exports = function list(state, startLine, endLine, silent) {
	  var ch,
	      contentStart,
	      i,
	      indent,
	      indentAfterMarker,
	      initial,
	      isOrdered,
	      itemLines,
	      l,
	      listLines,
	      listTokIdx,
	      markerCharCode,
	      markerValue,
	      max,
	      nextLine,
	      offset,
	      oldIndent,
	      oldLIndent,
	      oldParentType,
	      oldTShift,
	      oldTight,
	      pos,
	      posAfterMarker,
	      prevEmptyEnd,
	      start,
	      terminate,
	      terminatorRules,
	      token,
	      isTerminatingParagraph = false,
	      tight = true;

	  // limit conditions when list can interrupt
	  // a paragraph (validation mode only)
	  if (silent && state.parentType === 'paragraph') {
	    // Next list item should still terminate previous list item;
	    //
	    // This code can fail if plugins use blkIndent as well as lists,
	    // but I hope the spec gets fixed long before that happens.
	    //
	    if (state.tShift[startLine] >= state.blkIndent) {
	      isTerminatingParagraph = true;
	    }
	  }

	  // Detect list type and position after marker
	  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
	    isOrdered = true;
	    start = state.bMarks[startLine] + state.tShift[startLine];
	    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

	    // If we're starting a new ordered list right after
	    // a paragraph, it should start with 1.
	    if (isTerminatingParagraph && markerValue !== 1) return false;

	  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
	    isOrdered = false;

	  } else {
	    return false;
	  }

	  // If we're starting a new unordered list right after
	  // a paragraph, first line should not be empty.
	  if (isTerminatingParagraph) {
	    if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false;
	  }

	  // We should terminate list on style change. Remember first one to compare.
	  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

	  // For validation mode we can terminate immediately
	  if (silent) { return true; }

	  // Start list
	  listTokIdx = state.tokens.length;

	  if (isOrdered) {
	    token       = state.push('ordered_list_open', 'ol', 1);
	    if (markerValue !== 1) {
	      token.attrs = [ [ 'start', markerValue ] ];
	    }

	  } else {
	    token       = state.push('bullet_list_open', 'ul', 1);
	  }

	  token.map    = listLines = [ startLine, 0 ];
	  token.markup = String.fromCharCode(markerCharCode);

	  //
	  // Iterate list items
	  //

	  nextLine = startLine;
	  prevEmptyEnd = false;
	  terminatorRules = state.md.block.ruler.getRules('list');

	  oldParentType = state.parentType;
	  state.parentType = 'list';

	  while (nextLine < endLine) {
	    pos = posAfterMarker;
	    max = state.eMarks[nextLine];

	    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

	    while (pos < max) {
	      ch = state.src.charCodeAt(pos);

	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          offset += 4 - (offset + state.bsCount[nextLine]) % 4;
	        } else {
	          offset++;
	        }
	      } else {
	        break;
	      }

	      pos++;
	    }

	    contentStart = pos;

	    if (contentStart >= max) {
	      // trimming space in "-    \n  3" case, indent is 1 here
	      indentAfterMarker = 1;
	    } else {
	      indentAfterMarker = offset - initial;
	    }

	    // If we have more than 4 spaces, the indent is 1
	    // (the rest is just indented code block)
	    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

	    // "  -  test"
	    //  ^^^^^ - calculating total length of this thing
	    indent = initial + indentAfterMarker;

	    // Run subparser & write tokens
	    token        = state.push('list_item_open', 'li', 1);
	    token.markup = String.fromCharCode(markerCharCode);
	    token.map    = itemLines = [ startLine, 0 ];

	    oldIndent = state.blkIndent;
	    oldTight = state.tight;
	    oldTShift = state.tShift[startLine];
	    oldLIndent = state.sCount[startLine];
	    state.blkIndent = indent;
	    state.tight = true;
	    state.tShift[startLine] = contentStart - state.bMarks[startLine];
	    state.sCount[startLine] = offset;

	    if (contentStart >= max && state.isEmpty(startLine + 1)) {
	      // workaround for this case
	      // (list item is empty, list terminates before "foo"):
	      // ~~~~~~~~
	      //   -
	      //
	      //     foo
	      // ~~~~~~~~
	      state.line = Math.min(state.line + 2, endLine);
	    } else {
	      state.md.block.tokenize(state, startLine, endLine, true);
	    }

	    // If any of list item is tight, mark list as tight
	    if (!state.tight || prevEmptyEnd) {
	      tight = false;
	    }
	    // Item become loose if finish with empty line,
	    // but we should filter last element, because it means list finish
	    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

	    state.blkIndent = oldIndent;
	    state.tShift[startLine] = oldTShift;
	    state.sCount[startLine] = oldLIndent;
	    state.tight = oldTight;

	    token        = state.push('list_item_close', 'li', -1);
	    token.markup = String.fromCharCode(markerCharCode);

	    nextLine = startLine = state.line;
	    itemLines[1] = nextLine;
	    contentStart = state.bMarks[startLine];

	    if (nextLine >= endLine) { break; }

	    //
	    // Try to check if list is terminated or continued.
	    //
	    if (state.sCount[nextLine] < state.blkIndent) { break; }

	    // fail if terminating block found
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) { break; }

	    // fail if list has another type
	    if (isOrdered) {
	      posAfterMarker = skipOrderedListMarker(state, nextLine);
	      if (posAfterMarker < 0) { break; }
	    } else {
	      posAfterMarker = skipBulletListMarker(state, nextLine);
	      if (posAfterMarker < 0) { break; }
	    }

	    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
	  }

	  // Finilize list
	  if (isOrdered) {
	    token = state.push('ordered_list_close', 'ol', -1);
	  } else {
	    token = state.push('bullet_list_close', 'ul', -1);
	  }
	  token.markup = String.fromCharCode(markerCharCode);

	  listLines[1] = nextLine;
	  state.line = nextLine;

	  state.parentType = oldParentType;

	  // mark paragraphs tight if needed
	  if (tight) {
	    markTightParagraphs(state, listTokIdx);
	  }

	  return true;
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	var parseLinkDestination = __webpack_require__(20);
	var parseLinkTitle       = __webpack_require__(21);
	var normalizeReference   = __webpack_require__(4).normalizeReference;
	var isSpace              = __webpack_require__(4).isSpace;


	module.exports = function reference(state, startLine, _endLine, silent) {
	  var ch,
	      destEndPos,
	      destEndLineNo,
	      endLine,
	      href,
	      i,
	      l,
	      label,
	      labelEnd,
	      oldParentType,
	      res,
	      start,
	      str,
	      terminate,
	      terminatorRules,
	      title,
	      lines = 0,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine],
	      nextLine = startLine + 1;

	  if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

	  // Simple check to quickly interrupt scan on [link](url) at the start of line.
	  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
	  while (++pos < max) {
	    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
	        state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
	      if (pos + 1 === max) { return false; }
	      if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
	      break;
	    }
	  }

	  endLine = state.lineMax;

	  // jump line-by-line until empty one or EOF
	  terminatorRules = state.md.block.ruler.getRules('reference');

	  oldParentType = state.parentType;
	  state.parentType = 'reference';

	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) { continue; }

	    // Some tags can terminate paragraph without empty line.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) { break; }
	  }

	  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
	  max = str.length;

	  for (pos = 1; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x5B /* [ */) {
	      return false;
	    } else if (ch === 0x5D /* ] */) {
	      labelEnd = pos;
	      break;
	    } else if (ch === 0x0A /* \n */) {
	      lines++;
	    } else if (ch === 0x5C /* \ */) {
	      pos++;
	      if (pos < max && str.charCodeAt(pos) === 0x0A) {
	        lines++;
	      }
	    }
	  }

	  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

	  // [label]:   destination   'title'
	  //         ^^^ skip optional whitespace here
	  for (pos = labelEnd + 2; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      lines++;
	    } else if (isSpace(ch)) {
	      /*eslint no-empty:0*/
	    } else {
	      break;
	    }
	  }

	  // [label]:   destination   'title'
	  //            ^^^^^^^^^^^ parse this
	  res = parseLinkDestination(str, pos, max);
	  if (!res.ok) { return false; }

	  href = state.md.normalizeLink(res.str);
	  if (!state.md.validateLink(href)) { return false; }

	  pos = res.pos;
	  lines += res.lines;

	  // save cursor state, we could require to rollback later
	  destEndPos = pos;
	  destEndLineNo = lines;

	  // [label]:   destination   'title'
	  //                       ^^^ skipping those spaces
	  start = pos;
	  for (; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      lines++;
	    } else if (isSpace(ch)) {
	      /*eslint no-empty:0*/
	    } else {
	      break;
	    }
	  }

	  // [label]:   destination   'title'
	  //                          ^^^^^^^ parse this
	  res = parseLinkTitle(str, pos, max);
	  if (pos < max && start !== pos && res.ok) {
	    title = res.str;
	    pos = res.pos;
	    lines += res.lines;
	  } else {
	    title = '';
	    pos = destEndPos;
	    lines = destEndLineNo;
	  }

	  // skip trailing spaces until the rest of the line
	  while (pos < max) {
	    ch = str.charCodeAt(pos);
	    if (!isSpace(ch)) { break; }
	    pos++;
	  }

	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    if (title) {
	      // garbage at the end of the line after title,
	      // but it could still be a valid reference if we roll back
	      title = '';
	      pos = destEndPos;
	      lines = destEndLineNo;
	      while (pos < max) {
	        ch = str.charCodeAt(pos);
	        if (!isSpace(ch)) { break; }
	        pos++;
	      }
	    }
	  }

	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    // garbage at the end of the line
	    return false;
	  }

	  label = normalizeReference(str.slice(1, labelEnd));
	  if (!label) {
	    // CommonMark 0.20 disallows empty labels
	    return false;
	  }

	  // Reference can not terminate anything. This check is for safety only.
	  /*istanbul ignore if*/
	  if (silent) { return true; }

	  if (typeof state.env.references === 'undefined') {
	    state.env.references = {};
	  }
	  if (typeof state.env.references[label] === 'undefined') {
	    state.env.references[label] = { title: title, href: href };
	  }

	  state.parentType = oldParentType;

	  state.line = startLine + lines + 1;
	  return true;
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// heading (#, ##, ...)

	'use strict';

	var isSpace = __webpack_require__(4).isSpace;


	module.exports = function heading(state, startLine, endLine, silent) {
	  var ch, level, tmp, token,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  ch  = state.src.charCodeAt(pos);

	  if (ch !== 0x23/* # */ || pos >= max) { return false; }

	  // count heading level
	  level = 1;
	  ch = state.src.charCodeAt(++pos);
	  while (ch === 0x23/* # */ && pos < max && level <= 6) {
	    level++;
	    ch = state.src.charCodeAt(++pos);
	  }

	  if (level > 6 || (pos < max && !isSpace(ch))) { return false; }

	  if (silent) { return true; }

	  // Let's cut tails like '    ###  ' from the end of string

	  max = state.skipSpacesBack(max, pos);
	  tmp = state.skipCharsBack(max, 0x23, pos); // #
	  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
	    max = tmp;
	  }

	  state.line = startLine + 1;

	  token        = state.push('heading_open', 'h' + String(level), 1);
	  token.markup = '########'.slice(0, level);
	  token.map    = [ startLine, state.line ];

	  token          = state.push('inline', '', 0);
	  token.content  = state.src.slice(pos, max).trim();
	  token.map      = [ startLine, state.line ];
	  token.children = [];

	  token        = state.push('heading_close', 'h' + String(level), -1);
	  token.markup = '########'.slice(0, level);

	  return true;
	};


/***/ },
/* 42 */
/***/ function(module, exports) {

	// lheading (---, ===)

	'use strict';


	module.exports = function lheading(state, startLine, endLine/*, silent*/) {
	  var content, terminate, i, l, token, pos, max, level, marker,
	      nextLine = startLine + 1, oldParentType,
	      terminatorRules = state.md.block.ruler.getRules('paragraph');

	  oldParentType = state.parentType;
	  state.parentType = 'paragraph'; // use paragraph to match terminatorRules

	  // jump line-by-line until empty one or EOF
	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

	    //
	    // Check for underline in setext header
	    //
	    if (state.sCount[nextLine] >= state.blkIndent) {
	      pos = state.bMarks[nextLine] + state.tShift[nextLine];
	      max = state.eMarks[nextLine];

	      if (pos < max) {
	        marker = state.src.charCodeAt(pos);

	        if (marker === 0x2D/* - */ || marker === 0x3D/* = */) {
	          pos = state.skipChars(pos, marker);
	          pos = state.skipSpaces(pos);

	          if (pos >= max) {
	            level = (marker === 0x3D/* = */ ? 1 : 2);
	            break;
	          }
	        }
	      }
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) { continue; }

	    // Some tags can terminate paragraph without empty line.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) { break; }
	  }

	  if (!level) {
	    // Didn't find valid underline
	    return false;
	  }

	  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

	  state.line = nextLine + 1;

	  token          = state.push('heading_open', 'h' + String(level), 1);
	  token.markup   = String.fromCharCode(marker);
	  token.map      = [ startLine, state.line ];

	  token          = state.push('inline', '', 0);
	  token.content  = content;
	  token.map      = [ startLine, state.line - 1 ];
	  token.children = [];

	  token          = state.push('heading_close', 'h' + String(level), -1);
	  token.markup   = String.fromCharCode(marker);

	  state.parentType = oldParentType;

	  return true;
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// HTML block

	'use strict';


	var block_names = __webpack_require__(44);
	var HTML_OPEN_CLOSE_TAG_RE = __webpack_require__(45).HTML_OPEN_CLOSE_TAG_RE;

	// An array of opening and corresponding closing sequences for html tags,
	// last argument defines whether it can terminate a paragraph or not
	//
	var HTML_SEQUENCES = [
	  [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ],
	  [ /^<!--/,        /-->/,   true ],
	  [ /^<\?/,         /\?>/,   true ],
	  [ /^<![A-Z]/,     />/,     true ],
	  [ /^<!\[CDATA\[/, /\]\]>/, true ],
	  [ new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
	  [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false ]
	];


	module.exports = function html_block(state, startLine, endLine, silent) {
	  var i, nextLine, token, lineText,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  if (!state.md.options.html) { return false; }

	  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

	  lineText = state.src.slice(pos, max);

	  for (i = 0; i < HTML_SEQUENCES.length; i++) {
	    if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
	  }

	  if (i === HTML_SEQUENCES.length) { return false; }

	  if (silent) {
	    // true if this sequence can be a terminator, false otherwise
	    return HTML_SEQUENCES[i][2];
	  }

	  nextLine = startLine + 1;

	  // If we are here - we detected HTML block.
	  // Let's roll down till block end.
	  if (!HTML_SEQUENCES[i][1].test(lineText)) {
	    for (; nextLine < endLine; nextLine++) {
	      if (state.sCount[nextLine] < state.blkIndent) { break; }

	      pos = state.bMarks[nextLine] + state.tShift[nextLine];
	      max = state.eMarks[nextLine];
	      lineText = state.src.slice(pos, max);

	      if (HTML_SEQUENCES[i][1].test(lineText)) {
	        if (lineText.length !== 0) { nextLine++; }
	        break;
	      }
	    }
	  }

	  state.line = nextLine;

	  token         = state.push('html_block', '', 0);
	  token.map     = [ startLine, nextLine ];
	  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

	  return true;
	};


/***/ },
/* 44 */
/***/ function(module, exports) {

	// List of valid html blocks names, accorting to commonmark spec
	// http://jgm.github.io/CommonMark/spec.html#html-blocks

	'use strict';


	module.exports = [
	  'address',
	  'article',
	  'aside',
	  'base',
	  'basefont',
	  'blockquote',
	  'body',
	  'caption',
	  'center',
	  'col',
	  'colgroup',
	  'dd',
	  'details',
	  'dialog',
	  'dir',
	  'div',
	  'dl',
	  'dt',
	  'fieldset',
	  'figcaption',
	  'figure',
	  'footer',
	  'form',
	  'frame',
	  'frameset',
	  'h1',
	  'head',
	  'header',
	  'hr',
	  'html',
	  'iframe',
	  'legend',
	  'li',
	  'link',
	  'main',
	  'menu',
	  'menuitem',
	  'meta',
	  'nav',
	  'noframes',
	  'ol',
	  'optgroup',
	  'option',
	  'p',
	  'param',
	  'pre',
	  'section',
	  'source',
	  'title',
	  'summary',
	  'table',
	  'tbody',
	  'td',
	  'tfoot',
	  'th',
	  'thead',
	  'title',
	  'tr',
	  'track',
	  'ul'
	];


/***/ },
/* 45 */
/***/ function(module, exports) {

	// Regexps to match html elements

	'use strict';

	var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

	var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
	var single_quoted = "'[^']*'";
	var double_quoted = '"[^"]*"';

	var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

	var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

	var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

	var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
	var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
	var processing  = '<[?].*?[?]>';
	var declaration = '<![A-Z]+\\s+[^>]*>';
	var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

	var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
	                        '|' + processing + '|' + declaration + '|' + cdata + ')');
	var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

	module.exports.HTML_TAG_RE = HTML_TAG_RE;
	module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;


/***/ },
/* 46 */
/***/ function(module, exports) {

	// Paragraph

	'use strict';


	module.exports = function paragraph(state, startLine/*, endLine*/) {
	  var content, terminate, i, l, token, oldParentType,
	      nextLine = startLine + 1,
	      terminatorRules = state.md.block.ruler.getRules('paragraph'),
	      endLine = state.lineMax;

	  oldParentType = state.parentType;
	  state.parentType = 'paragraph';

	  // jump line-by-line until empty one or EOF
	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) { continue; }

	    // Some tags can terminate paragraph without empty line.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) { break; }
	  }

	  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

	  state.line = nextLine;

	  token          = state.push('paragraph_open', 'p', 1);
	  token.map      = [ startLine, state.line ];

	  token          = state.push('inline', '', 0);
	  token.content  = content;
	  token.map      = [ startLine, state.line ];
	  token.children = [];

	  token          = state.push('paragraph_close', 'p', -1);

	  state.parentType = oldParentType;

	  return true;
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// Parser state class

	'use strict';

	var Token = __webpack_require__(32);
	var isSpace = __webpack_require__(4).isSpace;


	function StateBlock(src, md, env, tokens) {
	  var ch, s, start, pos, len, indent, offset, indent_found;

	  this.src = src;

	  // link to parser instance
	  this.md     = md;

	  this.env = env;

	  //
	  // Internal state vartiables
	  //

	  this.tokens = tokens;

	  this.bMarks = [];  // line begin offsets for fast jumps
	  this.eMarks = [];  // line end offsets for fast jumps
	  this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
	  this.sCount = [];  // indents for each line (tabs expanded)

	  // An amount of virtual spaces (tabs expanded) between beginning
	  // of each line (bMarks) and real beginning of that line.
	  //
	  // It exists only as a hack because blockquotes override bMarks
	  // losing information in the process.
	  //
	  // It's used only when expanding tabs, you can think about it as
	  // an initial tab length, e.g. bsCount=21 applied to string `\t123`
	  // means first tab should be expanded to 4-21%4 === 3 spaces.
	  //
	  this.bsCount = [];

	  // block parser variables
	  this.blkIndent  = 0; // required block content indent
	                       // (for example, if we are in list)
	  this.line       = 0; // line index in src
	  this.lineMax    = 0; // lines count
	  this.tight      = false;  // loose/tight mode for lists
	  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

	  // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
	  // used in lists to determine if they interrupt a paragraph
	  this.parentType = 'root';

	  this.level = 0;

	  // renderer
	  this.result = '';

	  // Create caches
	  // Generate markers.
	  s = this.src;
	  indent_found = false;

	  for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
	    ch = s.charCodeAt(pos);

	    if (!indent_found) {
	      if (isSpace(ch)) {
	        indent++;

	        if (ch === 0x09) {
	          offset += 4 - offset % 4;
	        } else {
	          offset++;
	        }
	        continue;
	      } else {
	        indent_found = true;
	      }
	    }

	    if (ch === 0x0A || pos === len - 1) {
	      if (ch !== 0x0A) { pos++; }
	      this.bMarks.push(start);
	      this.eMarks.push(pos);
	      this.tShift.push(indent);
	      this.sCount.push(offset);
	      this.bsCount.push(0);

	      indent_found = false;
	      indent = 0;
	      offset = 0;
	      start = pos + 1;
	    }
	  }

	  // Push fake entry to simplify cache bounds checks
	  this.bMarks.push(s.length);
	  this.eMarks.push(s.length);
	  this.tShift.push(0);
	  this.sCount.push(0);
	  this.bsCount.push(0);

	  this.lineMax = this.bMarks.length - 1; // don't count last fake line
	}

	// Push new token to "stream".
	//
	StateBlock.prototype.push = function (type, tag, nesting) {
	  var token = new Token(type, tag, nesting);
	  token.block = true;

	  if (nesting < 0) { this.level--; }
	  token.level = this.level;
	  if (nesting > 0) { this.level++; }

	  this.tokens.push(token);
	  return token;
	};

	StateBlock.prototype.isEmpty = function isEmpty(line) {
	  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
	};

	StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
	  for (var max = this.lineMax; from < max; from++) {
	    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
	      break;
	    }
	  }
	  return from;
	};

	// Skip spaces from given position.
	StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
	  var ch;

	  for (var max = this.src.length; pos < max; pos++) {
	    ch = this.src.charCodeAt(pos);
	    if (!isSpace(ch)) { break; }
	  }
	  return pos;
	};

	// Skip spaces from given position in reverse.
	StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
	  if (pos <= min) { return pos; }

	  while (pos > min) {
	    if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1; }
	  }
	  return pos;
	};

	// Skip char codes from given position
	StateBlock.prototype.skipChars = function skipChars(pos, code) {
	  for (var max = this.src.length; pos < max; pos++) {
	    if (this.src.charCodeAt(pos) !== code) { break; }
	  }
	  return pos;
	};

	// Skip char codes reverse from given position - 1
	StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
	  if (pos <= min) { return pos; }

	  while (pos > min) {
	    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
	  }
	  return pos;
	};

	// cut lines range from source.
	StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
	  var i, lineIndent, ch, first, last, queue, lineStart,
	      line = begin;

	  if (begin >= end) {
	    return '';
	  }

	  queue = new Array(end - begin);

	  for (i = 0; line < end; line++, i++) {
	    lineIndent = 0;
	    lineStart = first = this.bMarks[line];

	    if (line + 1 < end || keepLastLF) {
	      // No need for bounds check because we have fake entry on tail.
	      last = this.eMarks[line] + 1;
	    } else {
	      last = this.eMarks[line];
	    }

	    while (first < last && lineIndent < indent) {
	      ch = this.src.charCodeAt(first);

	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
	        } else {
	          lineIndent++;
	        }
	      } else if (first - lineStart < this.tShift[line]) {
	        // patched tShift masked characters to look like spaces (blockquotes, list markers)
	        lineIndent++;
	      } else {
	        break;
	      }

	      first++;
	    }

	    if (lineIndent > indent) {
	      // partially expanding tabs in code blocks, e.g '\t\tfoobar'
	      // with indent=2 becomes '  \tfoobar'
	      queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
	    } else {
	      queue[i] = this.src.slice(first, last);
	    }
	  }

	  return queue.join('');
	};

	// re-export Token class to use in block rules
	StateBlock.prototype.Token = Token;


	module.exports = StateBlock;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class ParserInline
	 *
	 * Tokenizes paragraph content.
	 **/
	'use strict';


	var Ruler           = __webpack_require__(24);


	////////////////////////////////////////////////////////////////////////////////
	// Parser rules

	var _rules = [
	  [ 'text',            __webpack_require__(49) ],
	  [ 'newline',         __webpack_require__(50) ],
	  [ 'escape',          __webpack_require__(51) ],
	  [ 'backticks',       __webpack_require__(52) ],
	  [ 'strikethrough',   __webpack_require__(53).tokenize ],
	  [ 'emphasis',        __webpack_require__(54).tokenize ],
	  [ 'link',            __webpack_require__(55) ],
	  [ 'image',           __webpack_require__(56) ],
	  [ 'autolink',        __webpack_require__(57) ],
	  [ 'html_inline',     __webpack_require__(58) ],
	  [ 'entity',          __webpack_require__(59) ]
	];

	var _rules2 = [
	  [ 'balance_pairs',   __webpack_require__(60) ],
	  [ 'strikethrough',   __webpack_require__(53).postProcess ],
	  [ 'emphasis',        __webpack_require__(54).postProcess ],
	  [ 'text_collapse',   __webpack_require__(61) ]
	];


	/**
	 * new ParserInline()
	 **/
	function ParserInline() {
	  var i;

	  /**
	   * ParserInline#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of inline rules.
	   **/
	  this.ruler = new Ruler();

	  for (i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1]);
	  }

	  /**
	   * ParserInline#ruler2 -> Ruler
	   *
	   * [[Ruler]] instance. Second ruler used for post-processing
	   * (e.g. in emphasis-like rules).
	   **/
	  this.ruler2 = new Ruler();

	  for (i = 0; i < _rules2.length; i++) {
	    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
	  }
	}


	// Skip single token by running all rules in validation mode;
	// returns `true` if any rule reported success
	//
	ParserInline.prototype.skipToken = function (state) {
	  var ok, i, pos = state.pos,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      maxNesting = state.md.options.maxNesting,
	      cache = state.cache;


	  if (typeof cache[pos] !== 'undefined') {
	    state.pos = cache[pos];
	    return;
	  }

	  if (state.level < maxNesting) {
	    for (i = 0; i < len; i++) {
	      // Increment state.level and decrement it later to limit recursion.
	      // It's harmless to do here, because no tokens are created. But ideally,
	      // we'd need a separate private state variable for this purpose.
	      //
	      state.level++;
	      ok = rules[i](state, true);
	      state.level--;

	      if (ok) { break; }
	    }
	  } else {
	    // Too much nesting, just skip until the end of the paragraph.
	    //
	    // NOTE: this will cause links to behave incorrectly in the following case,
	    //       when an amount of `[` is exactly equal to `maxNesting + 1`:
	    //
	    //       [[[[[[[[[[[[[[[[[[[[[foo]()
	    //
	    // TODO: remove this workaround when CM standard will allow nested links
	    //       (we can replace it by preventing links from being parsed in
	    //       validation mode)
	    //
	    state.pos = state.posMax;
	  }

	  if (!ok) { state.pos++; }
	  cache[pos] = state.pos;
	};


	// Generate tokens for input range
	//
	ParserInline.prototype.tokenize = function (state) {
	  var ok, i,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      end = state.posMax,
	      maxNesting = state.md.options.maxNesting;

	  while (state.pos < end) {
	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.pos`
	    // - update `state.tokens`
	    // - return true

	    if (state.level < maxNesting) {
	      for (i = 0; i < len; i++) {
	        ok = rules[i](state, false);
	        if (ok) { break; }
	      }
	    }

	    if (ok) {
	      if (state.pos >= end) { break; }
	      continue;
	    }

	    state.pending += state.src[state.pos++];
	  }

	  if (state.pending) {
	    state.pushPending();
	  }
	};


	/**
	 * ParserInline.parse(str, md, env, outTokens)
	 *
	 * Process input string and push inline tokens into `outTokens`
	 **/
	ParserInline.prototype.parse = function (str, md, env, outTokens) {
	  var i, rules, len;
	  var state = new this.State(str, md, env, outTokens);

	  this.tokenize(state);

	  rules = this.ruler2.getRules('');
	  len = rules.length;

	  for (i = 0; i < len; i++) {
	    rules[i](state);
	  }
	};


	ParserInline.prototype.State = __webpack_require__(62);


	module.exports = ParserInline;


/***/ },
/* 49 */
/***/ function(module, exports) {

	// Skip text characters for text token, place those to pending buffer
	// and increment current pos

	'use strict';


	// Rule to skip pure text
	// '{}$%@~+=:' reserved for extentions

	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

	// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character
	function isTerminatorChar(ch) {
	  switch (ch) {
	    case 0x0A/* \n */:
	    case 0x21/* ! */:
	    case 0x23/* # */:
	    case 0x24/* $ */:
	    case 0x25/* % */:
	    case 0x26/* & */:
	    case 0x2A/* * */:
	    case 0x2B/* + */:
	    case 0x2D/* - */:
	    case 0x3A/* : */:
	    case 0x3C/* < */:
	    case 0x3D/* = */:
	    case 0x3E/* > */:
	    case 0x40/* @ */:
	    case 0x5B/* [ */:
	    case 0x5C/* \ */:
	    case 0x5D/* ] */:
	    case 0x5E/* ^ */:
	    case 0x5F/* _ */:
	    case 0x60/* ` */:
	    case 0x7B/* { */:
	    case 0x7D/* } */:
	    case 0x7E/* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}

	module.exports = function text(state, silent) {
	  var pos = state.pos;

	  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
	    pos++;
	  }

	  if (pos === state.pos) { return false; }

	  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

	  state.pos = pos;

	  return true;
	};

	// Alternative implementation, for memory.
	//
	// It costs 10% of performance, but allows extend terminators list, if place it
	// to `ParcerInline` property. Probably, will switch to it sometime, such
	// flexibility required.

	/*
	var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

	module.exports = function text(state, silent) {
	  var pos = state.pos,
	      idx = state.src.slice(pos).search(TERMINATOR_RE);

	  // first char is terminator -> empty text
	  if (idx === 0) { return false; }

	  // no terminator -> text till end of string
	  if (idx < 0) {
	    if (!silent) { state.pending += state.src.slice(pos); }
	    state.pos = state.src.length;
	    return true;
	  }

	  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

	  state.pos += idx;

	  return true;
	};*/


/***/ },
/* 50 */
/***/ function(module, exports) {

	// Proceess '\n'

	'use strict';

	module.exports = function newline(state, silent) {
	  var pmax, max, pos = state.pos;

	  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

	  pmax = state.pending.length - 1;
	  max = state.posMax;

	  // '  \n' -> hardbreak
	  // Lookup in pending chars is bad practice! Don't copy to other rules!
	  // Pending string is stored in concat mode, indexed lookups will cause
	  // convertion to flat mode.
	  if (!silent) {
	    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
	      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
	        state.pending = state.pending.replace(/ +$/, '');
	        state.push('hardbreak', 'br', 0);
	      } else {
	        state.pending = state.pending.slice(0, -1);
	        state.push('softbreak', 'br', 0);
	      }

	    } else {
	      state.push('softbreak', 'br', 0);
	    }
	  }

	  pos++;

	  // skip heading spaces for next line
	  while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

	  state.pos = pos;
	  return true;
	};


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	// Proceess escaped chars and hardbreaks

	'use strict';

	var isSpace = __webpack_require__(4).isSpace;

	var ESCAPED = [];

	for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

	'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
	  .split('').forEach(function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


	module.exports = function escape(state, silent) {
	  var ch, pos = state.pos, max = state.posMax;

	  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

	  pos++;

	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (ch < 256 && ESCAPED[ch] !== 0) {
	      if (!silent) { state.pending += state.src[pos]; }
	      state.pos += 2;
	      return true;
	    }

	    if (ch === 0x0A) {
	      if (!silent) {
	        state.push('hardbreak', 'br', 0);
	      }

	      pos++;
	      // skip leading whitespaces from next line
	      while (pos < max) {
	        ch = state.src.charCodeAt(pos);
	        if (!isSpace(ch)) { break; }
	        pos++;
	      }

	      state.pos = pos;
	      return true;
	    }
	  }

	  if (!silent) { state.pending += '\\'; }
	  state.pos++;
	  return true;
	};


/***/ },
/* 52 */
/***/ function(module, exports) {

	// Parse backticks

	'use strict';

	module.exports = function backtick(state, silent) {
	  var start, max, marker, matchStart, matchEnd, token,
	      pos = state.pos,
	      ch = state.src.charCodeAt(pos);

	  if (ch !== 0x60/* ` */) { return false; }

	  start = pos;
	  pos++;
	  max = state.posMax;

	  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

	  marker = state.src.slice(start, pos);

	  matchStart = matchEnd = pos;

	  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
	    matchEnd = matchStart + 1;

	    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

	    if (matchEnd - matchStart === marker.length) {
	      if (!silent) {
	        token         = state.push('code_inline', 'code', 0);
	        token.markup  = marker;
	        token.content = state.src.slice(pos, matchStart)
	                                 .replace(/[ \n]+/g, ' ')
	                                 .trim();
	      }
	      state.pos = matchEnd;
	      return true;
	    }
	  }

	  if (!silent) { state.pending += marker; }
	  state.pos += marker.length;
	  return true;
	};


/***/ },
/* 53 */
/***/ function(module, exports) {

	// ~~strike through~~
	//
	'use strict';


	// Insert each marker as a separate text token, and add it to delimiter list
	//
	module.exports.tokenize = function strikethrough(state, silent) {
	  var i, scanned, token, len, ch,
	      start = state.pos,
	      marker = state.src.charCodeAt(start);

	  if (silent) { return false; }

	  if (marker !== 0x7E/* ~ */) { return false; }

	  scanned = state.scanDelims(state.pos, true);
	  len = scanned.length;
	  ch = String.fromCharCode(marker);

	  if (len < 2) { return false; }

	  if (len % 2) {
	    token         = state.push('text', '', 0);
	    token.content = ch;
	    len--;
	  }

	  for (i = 0; i < len; i += 2) {
	    token         = state.push('text', '', 0);
	    token.content = ch + ch;

	    state.delimiters.push({
	      marker: marker,
	      jump:   i,
	      token:  state.tokens.length - 1,
	      level:  state.level,
	      end:    -1,
	      open:   scanned.can_open,
	      close:  scanned.can_close
	    });
	  }

	  state.pos += scanned.length;

	  return true;
	};


	// Walk through delimiter list and replace text tokens with tags
	//
	module.exports.postProcess = function strikethrough(state) {
	  var i, j,
	      startDelim,
	      endDelim,
	      token,
	      loneMarkers = [],
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    startDelim = delimiters[i];

	    if (startDelim.marker !== 0x7E/* ~ */) {
	      continue;
	    }

	    if (startDelim.end === -1) {
	      continue;
	    }

	    endDelim = delimiters[startDelim.end];

	    token         = state.tokens[startDelim.token];
	    token.type    = 's_open';
	    token.tag     = 's';
	    token.nesting = 1;
	    token.markup  = '~~';
	    token.content = '';

	    token         = state.tokens[endDelim.token];
	    token.type    = 's_close';
	    token.tag     = 's';
	    token.nesting = -1;
	    token.markup  = '~~';
	    token.content = '';

	    if (state.tokens[endDelim.token - 1].type === 'text' &&
	        state.tokens[endDelim.token - 1].content === '~') {

	      loneMarkers.push(endDelim.token - 1);
	    }
	  }

	  // If a marker sequence has an odd number of characters, it's splitted
	  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
	  // start of the sequence.
	  //
	  // So, we have to move all those markers after subsequent s_close tags.
	  //
	  while (loneMarkers.length) {
	    i = loneMarkers.pop();
	    j = i + 1;

	    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
	      j++;
	    }

	    j--;

	    if (i !== j) {
	      token = state.tokens[j];
	      state.tokens[j] = state.tokens[i];
	      state.tokens[i] = token;
	    }
	  }
	};


/***/ },
/* 54 */
/***/ function(module, exports) {

	// Process *this* and _that_
	//
	'use strict';


	// Insert each marker as a separate text token, and add it to delimiter list
	//
	module.exports.tokenize = function emphasis(state, silent) {
	  var i, scanned, token,
	      start = state.pos,
	      marker = state.src.charCodeAt(start);

	  if (silent) { return false; }

	  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false; }

	  scanned = state.scanDelims(state.pos, marker === 0x2A);

	  for (i = 0; i < scanned.length; i++) {
	    token         = state.push('text', '', 0);
	    token.content = String.fromCharCode(marker);

	    state.delimiters.push({
	      // Char code of the starting marker (number).
	      //
	      marker: marker,

	      // Total length of these series of delimiters.
	      //
	      length: scanned.length,

	      // An amount of characters before this one that's equivalent to
	      // current one. In plain English: if this delimiter does not open
	      // an emphasis, neither do previous `jump` characters.
	      //
	      // Used to skip sequences like "*****" in one step, for 1st asterisk
	      // value will be 0, for 2nd it's 1 and so on.
	      //
	      jump:   i,

	      // A position of the token this delimiter corresponds to.
	      //
	      token:  state.tokens.length - 1,

	      // Token level.
	      //
	      level:  state.level,

	      // If this delimiter is matched as a valid opener, `end` will be
	      // equal to its position, otherwise it's `-1`.
	      //
	      end:    -1,

	      // Boolean flags that determine if this delimiter could open or close
	      // an emphasis.
	      //
	      open:   scanned.can_open,
	      close:  scanned.can_close
	    });
	  }

	  state.pos += scanned.length;

	  return true;
	};


	// Walk through delimiter list and replace text tokens with tags
	//
	module.exports.postProcess = function emphasis(state) {
	  var i,
	      startDelim,
	      endDelim,
	      token,
	      ch,
	      isStrong,
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    startDelim = delimiters[i];

	    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
	      continue;
	    }

	    // Process only opening markers
	    if (startDelim.end === -1) {
	      continue;
	    }

	    endDelim = delimiters[startDelim.end];

	    // If the next delimiter has the same marker and is adjacent to this one,
	    // merge those into one strong delimiter.
	    //
	    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
	    //
	    isStrong = i + 1 < max &&
	               delimiters[i + 1].end === startDelim.end - 1 &&
	               delimiters[i + 1].token === startDelim.token + 1 &&
	               delimiters[startDelim.end - 1].token === endDelim.token - 1 &&
	               delimiters[i + 1].marker === startDelim.marker;

	    ch = String.fromCharCode(startDelim.marker);

	    token         = state.tokens[startDelim.token];
	    token.type    = isStrong ? 'strong_open' : 'em_open';
	    token.tag     = isStrong ? 'strong' : 'em';
	    token.nesting = 1;
	    token.markup  = isStrong ? ch + ch : ch;
	    token.content = '';

	    token         = state.tokens[endDelim.token];
	    token.type    = isStrong ? 'strong_close' : 'em_close';
	    token.tag     = isStrong ? 'strong' : 'em';
	    token.nesting = -1;
	    token.markup  = isStrong ? ch + ch : ch;
	    token.content = '';

	    if (isStrong) {
	      state.tokens[delimiters[i + 1].token].content = '';
	      state.tokens[delimiters[startDelim.end - 1].token].content = '';
	      i++;
	    }
	  }
	};


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// Process [link](<to> "stuff")

	'use strict';

	var parseLinkLabel       = __webpack_require__(19);
	var parseLinkDestination = __webpack_require__(20);
	var parseLinkTitle       = __webpack_require__(21);
	var normalizeReference   = __webpack_require__(4).normalizeReference;
	var isSpace              = __webpack_require__(4).isSpace;


	module.exports = function link(state, silent) {
	  var attrs,
	      code,
	      label,
	      labelEnd,
	      labelStart,
	      pos,
	      res,
	      ref,
	      title,
	      token,
	      href = '',
	      oldPos = state.pos,
	      max = state.posMax,
	      start = state.pos;

	  if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

	  labelStart = state.pos + 1;
	  labelEnd = parseLinkLabel(state, state.pos, true);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) { return false; }

	  pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
	    //
	    // Inline link
	    //

	    // [link](  <href>  "title"  )
	    //        ^^ skipping these spaces
	    pos++;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) { break; }
	    }
	    if (pos >= max) { return false; }

	    // [link](  <href>  "title"  )
	    //          ^^^^^^ parsing link destination
	    start = pos;
	    res = parseLinkDestination(state.src, pos, state.posMax);
	    if (res.ok) {
	      href = state.md.normalizeLink(res.str);
	      if (state.md.validateLink(href)) {
	        pos = res.pos;
	      } else {
	        href = '';
	      }
	    }

	    // [link](  <href>  "title"  )
	    //                ^^ skipping these spaces
	    start = pos;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) { break; }
	    }

	    // [link](  <href>  "title"  )
	    //                  ^^^^^^^ parsing link title
	    res = parseLinkTitle(state.src, pos, state.posMax);
	    if (pos < max && start !== pos && res.ok) {
	      title = res.str;
	      pos = res.pos;

	      // [link](  <href>  "title"  )
	      //                         ^^ skipping these spaces
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) { break; }
	      }
	    } else {
	      title = '';
	    }

	    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
	      state.pos = oldPos;
	      return false;
	    }
	    pos++;
	  } else {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') { return false; }

	    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
	      start = pos + 1;
	      pos = parseLinkLabel(state, pos);
	      if (pos >= 0) {
	        label = state.src.slice(start, pos++);
	      } else {
	        pos = labelEnd + 1;
	      }
	    } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) { label = state.src.slice(labelStart, labelEnd); }

	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    state.pos = labelStart;
	    state.posMax = labelEnd;

	    token        = state.push('link_open', 'a', 1);
	    token.attrs  = attrs = [ [ 'href', href ] ];
	    if (title) {
	      attrs.push([ 'title', title ]);
	    }

	    state.md.inline.tokenize(state);

	    token        = state.push('link_close', 'a', -1);
	  }

	  state.pos = pos;
	  state.posMax = max;
	  return true;
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// Process ![image](<src> "title")

	'use strict';

	var parseLinkLabel       = __webpack_require__(19);
	var parseLinkDestination = __webpack_require__(20);
	var parseLinkTitle       = __webpack_require__(21);
	var normalizeReference   = __webpack_require__(4).normalizeReference;
	var isSpace              = __webpack_require__(4).isSpace;


	module.exports = function image(state, silent) {
	  var attrs,
	      code,
	      content,
	      label,
	      labelEnd,
	      labelStart,
	      pos,
	      ref,
	      res,
	      title,
	      token,
	      tokens,
	      start,
	      href = '',
	      oldPos = state.pos,
	      max = state.posMax;

	  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
	  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

	  labelStart = state.pos + 2;
	  labelEnd = parseLinkLabel(state, state.pos + 1, false);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) { return false; }

	  pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
	    //
	    // Inline link
	    //

	    // [link](  <href>  "title"  )
	    //        ^^ skipping these spaces
	    pos++;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) { break; }
	    }
	    if (pos >= max) { return false; }

	    // [link](  <href>  "title"  )
	    //          ^^^^^^ parsing link destination
	    start = pos;
	    res = parseLinkDestination(state.src, pos, state.posMax);
	    if (res.ok) {
	      href = state.md.normalizeLink(res.str);
	      if (state.md.validateLink(href)) {
	        pos = res.pos;
	      } else {
	        href = '';
	      }
	    }

	    // [link](  <href>  "title"  )
	    //                ^^ skipping these spaces
	    start = pos;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) { break; }
	    }

	    // [link](  <href>  "title"  )
	    //                  ^^^^^^^ parsing link title
	    res = parseLinkTitle(state.src, pos, state.posMax);
	    if (pos < max && start !== pos && res.ok) {
	      title = res.str;
	      pos = res.pos;

	      // [link](  <href>  "title"  )
	      //                         ^^ skipping these spaces
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) { break; }
	      }
	    } else {
	      title = '';
	    }

	    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
	      state.pos = oldPos;
	      return false;
	    }
	    pos++;
	  } else {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') { return false; }

	    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
	      start = pos + 1;
	      pos = parseLinkLabel(state, pos);
	      if (pos >= 0) {
	        label = state.src.slice(start, pos++);
	      } else {
	        pos = labelEnd + 1;
	      }
	    } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) { label = state.src.slice(labelStart, labelEnd); }

	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    content = state.src.slice(labelStart, labelEnd);

	    state.md.inline.parse(
	      content,
	      state.md,
	      state.env,
	      tokens = []
	    );

	    token          = state.push('image', 'img', 0);
	    token.attrs    = attrs = [ [ 'src', href ], [ 'alt', '' ] ];
	    token.children = tokens;
	    token.content  = content;

	    if (title) {
	      attrs.push([ 'title', title ]);
	    }
	  }

	  state.pos = pos;
	  state.posMax = max;
	  return true;
	};


/***/ },
/* 57 */
/***/ function(module, exports) {

	// Process autolinks '<protocol:...>'

	'use strict';


	/*eslint max-len:0*/
	var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
	var AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)>/;


	module.exports = function autolink(state, silent) {
	  var tail, linkMatch, emailMatch, url, fullUrl, token,
	      pos = state.pos;

	  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

	  tail = state.src.slice(pos);

	  if (tail.indexOf('>') < 0) { return false; }

	  if (AUTOLINK_RE.test(tail)) {
	    linkMatch = tail.match(AUTOLINK_RE);

	    url = linkMatch[0].slice(1, -1);
	    fullUrl = state.md.normalizeLink(url);
	    if (!state.md.validateLink(fullUrl)) { return false; }

	    if (!silent) {
	      token         = state.push('link_open', 'a', 1);
	      token.attrs   = [ [ 'href', fullUrl ] ];
	      token.markup  = 'autolink';
	      token.info    = 'auto';

	      token         = state.push('text', '', 0);
	      token.content = state.md.normalizeLinkText(url);

	      token         = state.push('link_close', 'a', -1);
	      token.markup  = 'autolink';
	      token.info    = 'auto';
	    }

	    state.pos += linkMatch[0].length;
	    return true;
	  }

	  if (EMAIL_RE.test(tail)) {
	    emailMatch = tail.match(EMAIL_RE);

	    url = emailMatch[0].slice(1, -1);
	    fullUrl = state.md.normalizeLink('mailto:' + url);
	    if (!state.md.validateLink(fullUrl)) { return false; }

	    if (!silent) {
	      token         = state.push('link_open', 'a', 1);
	      token.attrs   = [ [ 'href', fullUrl ] ];
	      token.markup  = 'autolink';
	      token.info    = 'auto';

	      token         = state.push('text', '', 0);
	      token.content = state.md.normalizeLinkText(url);

	      token         = state.push('link_close', 'a', -1);
	      token.markup  = 'autolink';
	      token.info    = 'auto';
	    }

	    state.pos += emailMatch[0].length;
	    return true;
	  }

	  return false;
	};


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// Process html tags

	'use strict';


	var HTML_TAG_RE = __webpack_require__(45).HTML_TAG_RE;


	function isLetter(ch) {
	  /*eslint no-bitwise:0*/
	  var lc = ch | 0x20; // to lower case
	  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
	}


	module.exports = function html_inline(state, silent) {
	  var ch, match, max, token,
	      pos = state.pos;

	  if (!state.md.options.html) { return false; }

	  // Check start
	  max = state.posMax;
	  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
	      pos + 2 >= max) {
	    return false;
	  }

	  // Quick fail on second char
	  ch = state.src.charCodeAt(pos + 1);
	  if (ch !== 0x21/* ! */ &&
	      ch !== 0x3F/* ? */ &&
	      ch !== 0x2F/* / */ &&
	      !isLetter(ch)) {
	    return false;
	  }

	  match = state.src.slice(pos).match(HTML_TAG_RE);
	  if (!match) { return false; }

	  if (!silent) {
	    token         = state.push('html_inline', '', 0);
	    token.content = state.src.slice(pos, pos + match[0].length);
	  }
	  state.pos += match[0].length;
	  return true;
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// Process html entity - &#123;, &#xAF;, &quot;, ...

	'use strict';

	var entities          = __webpack_require__(5);
	var has               = __webpack_require__(4).has;
	var isValidEntityCode = __webpack_require__(4).isValidEntityCode;
	var fromCodePoint     = __webpack_require__(4).fromCodePoint;


	var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
	var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


	module.exports = function entity(state, silent) {
	  var ch, code, match, pos = state.pos, max = state.posMax;

	  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

	  if (pos + 1 < max) {
	    ch = state.src.charCodeAt(pos + 1);

	    if (ch === 0x23 /* # */) {
	      match = state.src.slice(pos).match(DIGITAL_RE);
	      if (match) {
	        if (!silent) {
	          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
	          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
	        }
	        state.pos += match[0].length;
	        return true;
	      }
	    } else {
	      match = state.src.slice(pos).match(NAMED_RE);
	      if (match) {
	        if (has(entities, match[1])) {
	          if (!silent) { state.pending += entities[match[1]]; }
	          state.pos += match[0].length;
	          return true;
	        }
	      }
	    }
	  }

	  if (!silent) { state.pending += '&'; }
	  state.pos++;
	  return true;
	};


/***/ },
/* 60 */
/***/ function(module, exports) {

	// For each opening emphasis-like marker find a matching closing one
	//
	'use strict';


	module.exports = function link_pairs(state) {
	  var i, j, lastDelim, currDelim,
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    lastDelim = delimiters[i];

	    if (!lastDelim.close) { continue; }

	    j = i - lastDelim.jump - 1;

	    while (j >= 0) {
	      currDelim = delimiters[j];

	      if (currDelim.open &&
	          currDelim.marker === lastDelim.marker &&
	          currDelim.end < 0 &&
	          currDelim.level === lastDelim.level) {

	        // typeofs are for backward compatibility with plugins
	        var odd_match = (currDelim.close || lastDelim.open) &&
	                        typeof currDelim.length !== 'undefined' &&
	                        typeof lastDelim.length !== 'undefined' &&
	                        (currDelim.length + lastDelim.length) % 3 === 0;

	        if (!odd_match) {
	          lastDelim.jump = i - j;
	          lastDelim.open = false;
	          currDelim.end  = i;
	          currDelim.jump = 0;
	          break;
	        }
	      }

	      j -= currDelim.jump + 1;
	    }
	  }
	};


/***/ },
/* 61 */
/***/ function(module, exports) {

	// Merge adjacent text nodes into one, and re-calculate all token levels
	//
	'use strict';


	module.exports = function text_collapse(state) {
	  var curr, last,
	      level = 0,
	      tokens = state.tokens,
	      max = state.tokens.length;

	  for (curr = last = 0; curr < max; curr++) {
	    // re-calculate levels
	    level += tokens[curr].nesting;
	    tokens[curr].level = level;

	    if (tokens[curr].type === 'text' &&
	        curr + 1 < max &&
	        tokens[curr + 1].type === 'text') {

	      // collapse two adjacent text nodes
	      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
	    } else {
	      if (curr !== last) { tokens[last] = tokens[curr]; }

	      last++;
	    }
	  }

	  if (curr !== last) {
	    tokens.length = last;
	  }
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	// Inline parser state

	'use strict';


	var Token          = __webpack_require__(32);
	var isWhiteSpace   = __webpack_require__(4).isWhiteSpace;
	var isPunctChar    = __webpack_require__(4).isPunctChar;
	var isMdAsciiPunct = __webpack_require__(4).isMdAsciiPunct;


	function StateInline(src, md, env, outTokens) {
	  this.src = src;
	  this.env = env;
	  this.md = md;
	  this.tokens = outTokens;

	  this.pos = 0;
	  this.posMax = this.src.length;
	  this.level = 0;
	  this.pending = '';
	  this.pendingLevel = 0;

	  this.cache = {};        // Stores { start: end } pairs. Useful for backtrack
	                          // optimization of pairs parse (emphasis, strikes).

	  this.delimiters = [];   // Emphasis-like delimiters
	}


	// Flush pending text
	//
	StateInline.prototype.pushPending = function () {
	  var token = new Token('text', '', 0);
	  token.content = this.pending;
	  token.level = this.pendingLevel;
	  this.tokens.push(token);
	  this.pending = '';
	  return token;
	};


	// Push new token to "stream".
	// If pending text exists - flush it as text token
	//
	StateInline.prototype.push = function (type, tag, nesting) {
	  if (this.pending) {
	    this.pushPending();
	  }

	  var token = new Token(type, tag, nesting);

	  if (nesting < 0) { this.level--; }
	  token.level = this.level;
	  if (nesting > 0) { this.level++; }

	  this.pendingLevel = this.level;
	  this.tokens.push(token);
	  return token;
	};


	// Scan a sequence of emphasis-like markers, and determine whether
	// it can start an emphasis sequence or end an emphasis sequence.
	//
	//  - start - position to scan from (it should point at a valid marker);
	//  - canSplitWord - determine if these markers can be found inside a word
	//
	StateInline.prototype.scanDelims = function (start, canSplitWord) {
	  var pos = start, lastChar, nextChar, count, can_open, can_close,
	      isLastWhiteSpace, isLastPunctChar,
	      isNextWhiteSpace, isNextPunctChar,
	      left_flanking = true,
	      right_flanking = true,
	      max = this.posMax,
	      marker = this.src.charCodeAt(start);

	  // treat beginning of the line as a whitespace
	  lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

	  while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

	  count = pos - start;

	  // treat end of the line as a whitespace
	  nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

	  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

	  isLastWhiteSpace = isWhiteSpace(lastChar);
	  isNextWhiteSpace = isWhiteSpace(nextChar);

	  if (isNextWhiteSpace) {
	    left_flanking = false;
	  } else if (isNextPunctChar) {
	    if (!(isLastWhiteSpace || isLastPunctChar)) {
	      left_flanking = false;
	    }
	  }

	  if (isLastWhiteSpace) {
	    right_flanking = false;
	  } else if (isLastPunctChar) {
	    if (!(isNextWhiteSpace || isNextPunctChar)) {
	      right_flanking = false;
	    }
	  }

	  if (!canSplitWord) {
	    can_open  = left_flanking  && (!right_flanking || isLastPunctChar);
	    can_close = right_flanking && (!left_flanking  || isNextPunctChar);
	  } else {
	    can_open  = left_flanking;
	    can_close = right_flanking;
	  }

	  return {
	    can_open:  can_open,
	    can_close: can_close,
	    length:    count
	  };
	};


	// re-export Token class to use in block rules
	StateInline.prototype.Token = Token;


	module.exports = StateInline;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	////////////////////////////////////////////////////////////////////////////////
	// Helpers

	// Merge objects
	//
	function assign(obj /*from1, from2, from3, ...*/) {
	  var sources = Array.prototype.slice.call(arguments, 1);

	  sources.forEach(function (source) {
	    if (!source) { return; }

	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });

	  return obj;
	}

	function _class(obj) { return Object.prototype.toString.call(obj); }
	function isString(obj) { return _class(obj) === '[object String]'; }
	function isObject(obj) { return _class(obj) === '[object Object]'; }
	function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
	function isFunction(obj) { return _class(obj) === '[object Function]'; }


	function escapeRE(str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

	////////////////////////////////////////////////////////////////////////////////


	var defaultOptions = {
	  fuzzyLink: true,
	  fuzzyEmail: true,
	  fuzzyIP: false
	};


	function isOptionsObj(obj) {
	  return Object.keys(obj || {}).reduce(function (acc, k) {
	    return acc || defaultOptions.hasOwnProperty(k);
	  }, false);
	}


	var defaultSchemas = {
	  'http:': {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.http) {
	        // compile lazily, because "host"-containing variables can change on tlds update.
	        self.re.http =  new RegExp(
	          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
	        );
	      }
	      if (self.re.http.test(tail)) {
	        return tail.match(self.re.http)[0].length;
	      }
	      return 0;
	    }
	  },
	  'https:':  'http:',
	  'ftp:':    'http:',
	  '//':      {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.no_http) {
	      // compile lazily, because "host"-containing variables can change on tlds update.
	        self.re.no_http =  new RegExp(
	          '^' +
	          self.re.src_auth +
	          // Don't allow single-level domains, because of false positives like '//test'
	          // with code comments
	          '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
	          self.re.src_port +
	          self.re.src_host_terminator +
	          self.re.src_path,

	          'i'
	        );
	      }

	      if (self.re.no_http.test(tail)) {
	        // should not be `://` & `///`, that protects from errors in protocol name
	        if (pos >= 3 && text[pos - 3] === ':') { return 0; }
	        if (pos >= 3 && text[pos - 3] === '/') { return 0; }
	        return tail.match(self.re.no_http)[0].length;
	      }
	      return 0;
	    }
	  },
	  'mailto:': {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.mailto) {
	        self.re.mailto =  new RegExp(
	          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
	        );
	      }
	      if (self.re.mailto.test(tail)) {
	        return tail.match(self.re.mailto)[0].length;
	      }
	      return 0;
	    }
	  }
	};

	/*eslint-disable max-len*/

	// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
	var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

	// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
	var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

	/*eslint-enable max-len*/

	////////////////////////////////////////////////////////////////////////////////

	function resetScanCache(self) {
	  self.__index__ = -1;
	  self.__text_cache__   = '';
	}

	function createValidator(re) {
	  return function (text, pos) {
	    var tail = text.slice(pos);

	    if (re.test(tail)) {
	      return tail.match(re)[0].length;
	    }
	    return 0;
	  };
	}

	function createNormalizer() {
	  return function (match, self) {
	    self.normalize(match);
	  };
	}

	// Schemas compiler. Build regexps.
	//
	function compile(self) {

	  // Load & clone RE patterns.
	  var re = self.re = __webpack_require__(64)(self.__opts__);

	  // Define dynamic patterns
	  var tlds = self.__tlds__.slice();

	  self.onCompile();

	  if (!self.__tlds_replaced__) {
	    tlds.push(tlds_2ch_src_re);
	  }
	  tlds.push(re.src_xn);

	  re.src_tlds = tlds.join('|');

	  function untpl(tpl) { return tpl.replace('%TLDS%', re.src_tlds); }

	  re.email_fuzzy      = RegExp(untpl(re.tpl_email_fuzzy), 'i');
	  re.link_fuzzy       = RegExp(untpl(re.tpl_link_fuzzy), 'i');
	  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
	  re.host_fuzzy_test  = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

	  //
	  // Compile each schema
	  //

	  var aliases = [];

	  self.__compiled__ = {}; // Reset compiled data

	  function schemaError(name, val) {
	    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
	  }

	  Object.keys(self.__schemas__).forEach(function (name) {
	    var val = self.__schemas__[name];

	    // skip disabled methods
	    if (val === null) { return; }

	    var compiled = { validate: null, link: null };

	    self.__compiled__[name] = compiled;

	    if (isObject(val)) {
	      if (isRegExp(val.validate)) {
	        compiled.validate = createValidator(val.validate);
	      } else if (isFunction(val.validate)) {
	        compiled.validate = val.validate;
	      } else {
	        schemaError(name, val);
	      }

	      if (isFunction(val.normalize)) {
	        compiled.normalize = val.normalize;
	      } else if (!val.normalize) {
	        compiled.normalize = createNormalizer();
	      } else {
	        schemaError(name, val);
	      }

	      return;
	    }

	    if (isString(val)) {
	      aliases.push(name);
	      return;
	    }

	    schemaError(name, val);
	  });

	  //
	  // Compile postponed aliases
	  //

	  aliases.forEach(function (alias) {
	    if (!self.__compiled__[self.__schemas__[alias]]) {
	      // Silently fail on missed schemas to avoid errons on disable.
	      // schemaError(alias, self.__schemas__[alias]);
	      return;
	    }

	    self.__compiled__[alias].validate =
	      self.__compiled__[self.__schemas__[alias]].validate;
	    self.__compiled__[alias].normalize =
	      self.__compiled__[self.__schemas__[alias]].normalize;
	  });

	  //
	  // Fake record for guessed links
	  //
	  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

	  //
	  // Build schema condition
	  //
	  var slist = Object.keys(self.__compiled__)
	                      .filter(function (name) {
	                        // Filter disabled & fake schemas
	                        return name.length > 0 && self.__compiled__[name];
	                      })
	                      .map(escapeRE)
	                      .join('|');
	  // (?!_) cause 1.5x slowdown
	  self.re.schema_test   = RegExp('(^|(?!_)(?:[><]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
	  self.re.schema_search = RegExp('(^|(?!_)(?:[><]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');

	  self.re.pretest       = RegExp(
	                            '(' + self.re.schema_test.source + ')|' +
	                            '(' + self.re.host_fuzzy_test.source + ')|' +
	                            '@',
	                            'i');

	  //
	  // Cleanup
	  //

	  resetScanCache(self);
	}

	/**
	 * class Match
	 *
	 * Match result. Single element of array, returned by [[LinkifyIt#match]]
	 **/
	function Match(self, shift) {
	  var start = self.__index__,
	      end   = self.__last_index__,
	      text  = self.__text_cache__.slice(start, end);

	  /**
	   * Match#schema -> String
	   *
	   * Prefix (protocol) for matched string.
	   **/
	  this.schema    = self.__schema__.toLowerCase();
	  /**
	   * Match#index -> Number
	   *
	   * First position of matched string.
	   **/
	  this.index     = start + shift;
	  /**
	   * Match#lastIndex -> Number
	   *
	   * Next position after matched string.
	   **/
	  this.lastIndex = end + shift;
	  /**
	   * Match#raw -> String
	   *
	   * Matched string.
	   **/
	  this.raw       = text;
	  /**
	   * Match#text -> String
	   *
	   * Notmalized text of matched string.
	   **/
	  this.text      = text;
	  /**
	   * Match#url -> String
	   *
	   * Normalized url of matched string.
	   **/
	  this.url       = text;
	}

	function createMatch(self, shift) {
	  var match = new Match(self, shift);

	  self.__compiled__[match.schema].normalize(match, self);

	  return match;
	}


	/**
	 * class LinkifyIt
	 **/

	/**
	 * new LinkifyIt(schemas, options)
	 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Creates new linkifier instance with optional additional schemas.
	 * Can be called without `new` keyword for convenience.
	 *
	 * By default understands:
	 *
	 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
	 * - "fuzzy" links and emails (example.com, foo@bar.com).
	 *
	 * `schemas` is an object, where each key/value describes protocol/rule:
	 *
	 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
	 *   for example). `linkify-it` makes shure that prefix is not preceeded with
	 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
	 * - __value__ - rule to check tail after link prefix
	 *   - _String_ - just alias to existing rule
	 *   - _Object_
	 *     - _validate_ - validator function (should return matched length on success),
	 *       or `RegExp`.
	 *     - _normalize_ - optional function to normalize text & url of matched result
	 *       (for example, for @twitter mentions).
	 *
	 * `options`:
	 *
	 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
	 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
	 *   like version numbers. Default `false`.
	 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
	 *
	 **/
	function LinkifyIt(schemas, options) {
	  if (!(this instanceof LinkifyIt)) {
	    return new LinkifyIt(schemas, options);
	  }

	  if (!options) {
	    if (isOptionsObj(schemas)) {
	      options = schemas;
	      schemas = {};
	    }
	  }

	  this.__opts__           = assign({}, defaultOptions, options);

	  // Cache last tested result. Used to skip repeating steps on next `match` call.
	  this.__index__          = -1;
	  this.__last_index__     = -1; // Next scan position
	  this.__schema__         = '';
	  this.__text_cache__     = '';

	  this.__schemas__        = assign({}, defaultSchemas, schemas);
	  this.__compiled__       = {};

	  this.__tlds__           = tlds_default;
	  this.__tlds_replaced__  = false;

	  this.re = {};

	  compile(this);
	}


	/** chainable
	 * LinkifyIt#add(schema, definition)
	 * - schema (String): rule name (fixed pattern prefix)
	 * - definition (String|RegExp|Object): schema definition
	 *
	 * Add new rule definition. See constructor description for details.
	 **/
	LinkifyIt.prototype.add = function add(schema, definition) {
	  this.__schemas__[schema] = definition;
	  compile(this);
	  return this;
	};


	/** chainable
	 * LinkifyIt#set(options)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Set recognition options for links without schema.
	 **/
	LinkifyIt.prototype.set = function set(options) {
	  this.__opts__ = assign(this.__opts__, options);
	  return this;
	};


	/**
	 * LinkifyIt#test(text) -> Boolean
	 *
	 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
	 **/
	LinkifyIt.prototype.test = function test(text) {
	  // Reset scan cache
	  this.__text_cache__ = text;
	  this.__index__      = -1;

	  if (!text.length) { return false; }

	  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

	  // try to scan for link with schema - that's the most simple rule
	  if (this.re.schema_test.test(text)) {
	    re = this.re.schema_search;
	    re.lastIndex = 0;
	    while ((m = re.exec(text)) !== null) {
	      len = this.testSchemaAt(text, m[2], re.lastIndex);
	      if (len) {
	        this.__schema__     = m[2];
	        this.__index__      = m.index + m[1].length;
	        this.__last_index__ = m.index + m[0].length + len;
	        break;
	      }
	    }
	  }

	  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
	    // guess schemaless links
	    tld_pos = text.search(this.re.host_fuzzy_test);
	    if (tld_pos >= 0) {
	      // if tld is located after found link - no need to check fuzzy pattern
	      if (this.__index__ < 0 || tld_pos < this.__index__) {
	        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

	          shift = ml.index + ml[1].length;

	          if (this.__index__ < 0 || shift < this.__index__) {
	            this.__schema__     = '';
	            this.__index__      = shift;
	            this.__last_index__ = ml.index + ml[0].length;
	          }
	        }
	      }
	    }
	  }

	  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
	    // guess schemaless emails
	    at_pos = text.indexOf('@');
	    if (at_pos >= 0) {
	      // We can't skip this check, because this cases are possible:
	      // 192.168.1.1@gmail.com, my.in@example.com
	      if ((me = text.match(this.re.email_fuzzy)) !== null) {

	        shift = me.index + me[1].length;
	        next  = me.index + me[0].length;

	        if (this.__index__ < 0 || shift < this.__index__ ||
	            (shift === this.__index__ && next > this.__last_index__)) {
	          this.__schema__     = 'mailto:';
	          this.__index__      = shift;
	          this.__last_index__ = next;
	        }
	      }
	    }
	  }

	  return this.__index__ >= 0;
	};


	/**
	 * LinkifyIt#pretest(text) -> Boolean
	 *
	 * Very quick check, that can give false positives. Returns true if link MAY BE
	 * can exists. Can be used for speed optimization, when you need to check that
	 * link NOT exists.
	 **/
	LinkifyIt.prototype.pretest = function pretest(text) {
	  return this.re.pretest.test(text);
	};


	/**
	 * LinkifyIt#testSchemaAt(text, name, position) -> Number
	 * - text (String): text to scan
	 * - name (String): rule (schema) name
	 * - position (Number): text offset to check from
	 *
	 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
	 * at given position. Returns length of found pattern (0 on fail).
	 **/
	LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
	  // If not supported schema check requested - terminate
	  if (!this.__compiled__[schema.toLowerCase()]) {
	    return 0;
	  }
	  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
	};


	/**
	 * LinkifyIt#match(text) -> Array|null
	 *
	 * Returns array of found link descriptions or `null` on fail. We strongly
	 * recommend to use [[LinkifyIt#test]] first, for best speed.
	 *
	 * ##### Result match description
	 *
	 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
	 *   protocol-neutral  links.
	 * - __index__ - offset of matched text
	 * - __lastIndex__ - index of next char after mathch end
	 * - __raw__ - matched text
	 * - __text__ - normalized text
	 * - __url__ - link, generated from matched text
	 **/
	LinkifyIt.prototype.match = function match(text) {
	  var shift = 0, result = [];

	  // Try to take previous element from cache, if .test() called before
	  if (this.__index__ >= 0 && this.__text_cache__ === text) {
	    result.push(createMatch(this, shift));
	    shift = this.__last_index__;
	  }

	  // Cut head if cache was used
	  var tail = shift ? text.slice(shift) : text;

	  // Scan string until end reached
	  while (this.test(tail)) {
	    result.push(createMatch(this, shift));

	    tail = tail.slice(this.__last_index__);
	    shift += this.__last_index__;
	  }

	  if (result.length) {
	    return result;
	  }

	  return null;
	};


	/** chainable
	 * LinkifyIt#tlds(list [, keepOld]) -> this
	 * - list (Array): list of tlds
	 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
	 *
	 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
	 * to avoid false positives. By default this algorythm used:
	 *
	 * - hostname with any 2-letter root zones are ok.
	 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
	 *   are ok.
	 * - encoded (`xn--...`) root zones are ok.
	 *
	 * If list is replaced, then exact match for 2-chars root zones will be checked.
	 **/
	LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
	  list = Array.isArray(list) ? list : [ list ];

	  if (!keepOld) {
	    this.__tlds__ = list.slice();
	    this.__tlds_replaced__ = true;
	    compile(this);
	    return this;
	  }

	  this.__tlds__ = this.__tlds__.concat(list)
	                                  .sort()
	                                  .filter(function (el, idx, arr) {
	                                    return el !== arr[idx - 1];
	                                  })
	                                  .reverse();

	  compile(this);
	  return this;
	};

	/**
	 * LinkifyIt#normalize(match)
	 *
	 * Default normalizer (if schema does not define it's own).
	 **/
	LinkifyIt.prototype.normalize = function normalize(match) {

	  // Do minimal possible changes by default. Need to collect feedback prior
	  // to move forward https://github.com/markdown-it/linkify-it/issues/1

	  if (!match.schema) { match.url = 'http://' + match.url; }

	  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
	    match.url = 'mailto:' + match.url;
	  }
	};


	/**
	 * LinkifyIt#onCompile()
	 *
	 * Override to modify basic RegExp-s.
	 **/
	LinkifyIt.prototype.onCompile = function onCompile() {
	};


	module.exports = LinkifyIt;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';


	module.exports = function (opts) {
	  var re = {};

	  // Use direct extract instead of `regenerate` to reduse browserified size
	  re.src_Any = __webpack_require__(14).source;
	  re.src_Cc  = __webpack_require__(15).source;
	  re.src_Z   = __webpack_require__(17).source;
	  re.src_P   = __webpack_require__(7).source;

	  // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
	  re.src_ZPCc = [ re.src_Z, re.src_P, re.src_Cc ].join('|');

	  // \p{\Z\Cc} (white spaces + control)
	  re.src_ZCc = [ re.src_Z, re.src_Cc ].join('|');

	  // All possible word characters (everything without punctuation, spaces & controls)
	  // Defined via punctuation & spaces to save space
	  // Should be something like \p{\L\N\S\M} (\w but without `_`)
	  re.src_pseudo_letter       = '(?:(?!>|<|' + re.src_ZPCc + ')' + re.src_Any + ')';
	  // The same as abothe but without [0-9]
	  // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

	  ////////////////////////////////////////////////////////////////////////////////

	  re.src_ip4 =

	    '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

	  // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
	  re.src_auth    = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

	  re.src_port =

	    '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

	  re.src_host_terminator =

	    '(?=$|>|<|' + re.src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

	  re.src_path =

	    '(?:' +
	      '[/?#]' +
	        '(?:' +
	          '(?!' + re.src_ZCc + '|[()[\\]{}.,"\'?!\\-<>]).|' +
	          '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
	          '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
	          '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
	          '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
	          "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +
	          "\\'(?=" + re.src_pseudo_letter + '|[-]).|' +  // allow `I'm_king` if no pair found
	          '\\.{2,3}[a-zA-Z0-9%/]|' + // github has ... in commit range links. Restrict to
	                                     // - english
	                                     // - percent-encoded
	                                     // - parts of file path
	                                     // until more examples found.
	          '\\.(?!' + re.src_ZCc + '|[.]).|' +
	          (opts && opts['---'] ?
	            '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
	          :
	            '\\-+|'
	          ) +
	          '\\,(?!' + re.src_ZCc + ').|' +      // allow `,,,` in paths
	          '\\!(?!' + re.src_ZCc + '|[!]).|' +
	          '\\?(?!' + re.src_ZCc + '|[?]).' +
	        ')+' +
	      '|\\/' +
	    ')?';

	  re.src_email_name =

	    '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

	  re.src_xn =

	    'xn--[a-z0-9\\-]{1,59}';

	  // More to read about domain names
	  // http://serverfault.com/questions/638260/

	  re.src_domain_root =

	    // Allow letters & digits (http://test1)
	    '(?:' +
	      re.src_xn +
	      '|' +
	      re.src_pseudo_letter + '{1,63}' +
	    ')';

	  re.src_domain =

	    '(?:' +
	      re.src_xn +
	      '|' +
	      '(?:' + re.src_pseudo_letter + ')' +
	      '|' +
	      // don't allow `--` in domain names, because:
	      // - that can conflict with markdown &mdash; / &ndash;
	      // - nobody use those anyway
	      '(?:' + re.src_pseudo_letter + '(?:-(?!-)|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
	    ')';

	  re.src_host =

	    '(?:' +
	    // Don't need IP check, because digits are already allowed in normal domain names
	    //   src_ip4 +
	    // '|' +
	      '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/*_root*/ + ')' +
	    ')';

	  re.tpl_host_fuzzy =

	    '(?:' +
	      re.src_ip4 +
	    '|' +
	      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
	    ')';

	  re.tpl_host_no_ip_fuzzy =

	    '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

	  re.src_host_strict =

	    re.src_host + re.src_host_terminator;

	  re.tpl_host_fuzzy_strict =

	    re.tpl_host_fuzzy + re.src_host_terminator;

	  re.src_host_port_strict =

	    re.src_host + re.src_port + re.src_host_terminator;

	  re.tpl_host_port_fuzzy_strict =

	    re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

	  re.tpl_host_port_no_ip_fuzzy_strict =

	    re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;


	  ////////////////////////////////////////////////////////////////////////////////
	  // Main rules

	  // Rude test fuzzy links by host, for quick deny
	  re.tpl_host_fuzzy_test =

	    'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

	  re.tpl_email_fuzzy =

	      '(^|<|>|\\(|' + re.src_ZCc + ')(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

	  re.tpl_link_fuzzy =
	      // Fuzzy link can't be prepended with .:/\- and non punctuation.
	      // but can start with > (markdown blockquote)
	      '(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + re.src_ZPCc + '))' +
	      '((?![$+<=>^`|])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

	  re.tpl_link_no_ip_fuzzy =
	      // Fuzzy link can't be prepended with .:/\- and non punctuation.
	      // but can start with > (markdown blockquote)
	      '(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + re.src_ZPCc + '))' +
	      '((?![$+<=>^`|])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

	  return re;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.4.1 by @mathias */
	;(function(root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}

		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,

		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},

		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,

		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw new RangeError(errors[type]);
		}

		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}

		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * https://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;

				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);

			}

			return ucs2encode(output);
		}

		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}

		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.4.1',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) {
				// in Node.js, io.js, or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else {
				// in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else {
			// in Rhino or a web browser
			root.punycode = punycode;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(66)(module), (function() { return this; }())))

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 67 */
/***/ function(module, exports) {

	// markdown-it default options

	'use strict';


	module.exports = {
	  options: {
	    html:         false,        // Enable HTML tags in source
	    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
	    breaks:       false,        // Convert '\n' in paragraphs into <br>
	    langPrefix:   'language-',  // CSS language prefix for fenced blocks
	    linkify:      false,        // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer:  false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting:   100            // Internal protection, recursion limit
	  },

	  components: {

	    core: {},
	    block: {},
	    inline: {}
	  }
	};


/***/ },
/* 68 */
/***/ function(module, exports) {

	// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
	// modes. For example, to parse bold/italic only.

	'use strict';


	module.exports = {
	  options: {
	    html:         false,        // Enable HTML tags in source
	    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
	    breaks:       false,        // Convert '\n' in paragraphs into <br>
	    langPrefix:   'language-',  // CSS language prefix for fenced blocks
	    linkify:      false,        // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer:  false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting:   20            // Internal protection, recursion limit
	  },

	  components: {

	    core: {
	      rules: [
	        'normalize',
	        'block',
	        'inline'
	      ]
	    },

	    block: {
	      rules: [
	        'paragraph'
	      ]
	    },

	    inline: {
	      rules: [
	        'text'
	      ],
	      rules2: [
	        'balance_pairs',
	        'text_collapse'
	      ]
	    }
	  }
	};


/***/ },
/* 69 */
/***/ function(module, exports) {

	// Commonmark default options

	'use strict';


	module.exports = {
	  options: {
	    html:         true,         // Enable HTML tags in source
	    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
	    breaks:       false,        // Convert '\n' in paragraphs into <br>
	    langPrefix:   'language-',  // CSS language prefix for fenced blocks
	    linkify:      false,        // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer:  false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting:   20            // Internal protection, recursion limit
	  },

	  components: {

	    core: {
	      rules: [
	        'normalize',
	        'block',
	        'inline'
	      ]
	    },

	    block: {
	      rules: [
	        'blockquote',
	        'code',
	        'fence',
	        'heading',
	        'hr',
	        'html_block',
	        'lheading',
	        'list',
	        'reference',
	        'paragraph'
	      ]
	    },

	    inline: {
	      rules: [
	        'autolink',
	        'backticks',
	        'emphasis',
	        'entity',
	        'escape',
	        'html_inline',
	        'image',
	        'link',
	        'newline',
	        'text'
	      ],
	      rules2: [
	        'balance_pairs',
	        'emphasis',
	        'text_collapse'
	      ]
	    }
	  }
	};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/* Process inline math */
	/*
	Like markdown-it-simplemath, this is a stripped down, simplified version of:
	https://github.com/runarberg/markdown-it-math

	It differs in that it takes (a subset of) LaTeX as input and relies on KaTeX
	for rendering output.
	*/

	/*jslint node: true */
	'use strict';

	var katex = __webpack_require__(71);

	// Test if potential opening or closing delimieter
	// Assumes that there is a "$" at state.src[pos]
	function isValidDelim(state, pos) {
	    var prevChar, nextChar,
	        max = state.posMax,
	        can_open = true,
	        can_close = true;

	    prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
	    nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

	    // Check non-whitespace conditions for opening and closing, and
	    // check that closing delimeter isn't followed by a number
	    if (prevChar === 0x20/* " " */ || prevChar === 0x09/* \t */ ||
	            (nextChar >= 0x30/* "0" */ && nextChar <= 0x39/* "9" */)) {
	        can_close = false;
	    }
	    if (nextChar === 0x20/* " " */ || nextChar === 0x09/* \t */) {
	        can_open = false;
	    }

	    return {
	        can_open: can_open,
	        can_close: can_close
	    };
	}

	function math_inline(state, silent) {
	    var start, match, token, res, pos, esc_count;

	    if (state.src[state.pos] !== "$") { return false; }

	    res = isValidDelim(state, state.pos);
	    if (!res.can_open) {
	        if (!silent) { state.pending += "$"; }
	        state.pos += 1;
	        return true;
	    }

	    // First check for and bypass all properly escaped delimieters
	    // This loop will assume that the first leading backtick can not
	    // be the first character in state.src, which is known since
	    // we have found an opening delimieter already.
	    start = state.pos + 1;
	    match = start;
	    while ( (match = state.src.indexOf("$", match)) !== -1) {
	        // Found potential $, look for escapes, pos will point to
	        // first non escape when complete
	        pos = match - 1;
	        while (state.src[pos] === "\\") { pos -= 1; }

	        // Even number of escapes, potential closing delimiter found
	        if ( ((match - pos) % 2) == 1 ) { break; }
	        match += 1;
	    }

	    // No closing delimter found.  Consume $ and continue.
	    if (match === -1) {
	        if (!silent) { state.pending += "$"; }
	        state.pos = start;
	        return true;
	    }

	    // Check if we have empty content, ie: $$.  Do not parse.
	    if (match - start === 0) {
	        if (!silent) { state.pending += "$$"; }
	        state.pos = start + 1;
	        return true;
	    }

	    // Check for valid closing delimiter
	    res = isValidDelim(state, match);
	    if (!res.can_close) {
	        if (!silent) { state.pending += "$"; }
	        state.pos = start;
	        return true;
	    }

	    if (!silent) {
	        token         = state.push('math_inline', 'math', 0);
	        token.markup  = "$";
	        token.content = state.src.slice(start, match);
	    }

	    state.pos = match + 1;
	    return true;
	}

	function math_block(state, start, end, silent){
	    var firstLine, lastLine, next, lastPos, found = false, token,
	        pos = state.bMarks[start] + state.tShift[start],
	        max = state.eMarks[start]

	    if(pos + 2 > max){ return false; }
	    if(state.src.slice(pos,pos+2)!=='$$'){ return false; }

	    pos += 2;
	    firstLine = state.src.slice(pos,max);

	    if(silent){ return true; }
	    if(firstLine.trim().slice(-2)==='$$'){
	        // Single line expression
	        firstLine = firstLine.trim().slice(0, -2);
	        found = true;
	    }

	    for(next = start; !found; ){

	        next++;

	        if(next >= end){ break; }

	        pos = state.bMarks[next]+state.tShift[next];
	        max = state.eMarks[next];

	        if(pos < max && state.tShift[next] < state.blkIndent){
	            // non-empty line with negative indent should stop the list:
	            break;
	        }

	        if(state.src.slice(pos,max).trim().slice(-2)==='$$'){
	            lastPos = state.src.slice(0,max).lastIndexOf('$$');
	            lastLine = state.src.slice(pos,lastPos);
	            found = true;
	        }

	    }

	    state.line = next + 1;

	    token = state.push('math_block', 'math', 0);
	    token.block = true;
	    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '')
	    + state.getLines(start + 1, next, state.tShift[start], true)
	    + (lastLine && lastLine.trim() ? lastLine : '');
	    token.map = [ start, state.line ];
	    token.markup = '$$';
	    return true;
	}

	module.exports = function math_plugin(md, options) {
	    // Default options

	    options = options || {};

	    // set KaTeX as the renderer for markdown-it-simplemath
	    var katexInline = function(latex){
	        options.displayMode = false;
	        try{
	            return katex.renderToString(latex, options);
	        }
	        catch(error){
	            if(options.throwOnError){ console.log(error); }
	            return latex;
	        }
	    };

	    var inlineRenderer = function(tokens, idx){
	        return katexInline(tokens[idx].content);
	    };

	    var katexBlock = function(latex){
	        options.displayMode = true;
	        try{
	            return "<p>" + katex.renderToString(latex, options) + "</p>";
	        }
	        catch(error){
	            if(options.throwOnError){ console.log(error); }
	            return latex;
	        }
	    }

	    var blockRenderer = function(tokens, idx){
	        return  katexBlock(tokens[idx].content) + '\n';
	    }

	    md.inline.ruler.after('escape', 'math_inline', math_inline);
	    md.block.ruler.after('blockquote', 'math_block', math_block, {
	        alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
	    });
	    md.renderer.rules.math_inline = inlineRenderer;
	    md.renderer.rules.math_block = blockRenderer;
	};


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-console:0 */
	/**
	 * This is the main entry point for KaTeX. Here, we expose functions for
	 * rendering expressions either to DOM nodes or to markup strings.
	 *
	 * We also expose the ParseError class to check if errors thrown from KaTeX are
	 * errors in the expression, or errors in javascript handling.
	 */

	var ParseError = __webpack_require__(72);
	var Settings = __webpack_require__(73);

	var buildTree = __webpack_require__(74);
	var parseTree = __webpack_require__(87);
	var utils = __webpack_require__(79);

	/**
	 * Parse and build an expression, and place that expression in the DOM node
	 * given.
	 */
	var render = function(expression, baseNode, options) {
	    utils.clearNode(baseNode);

	    var settings = new Settings(options);

	    var tree = parseTree(expression, settings);
	    var node = buildTree(tree, expression, settings).toNode();

	    baseNode.appendChild(node);
	};

	// KaTeX's styles don't work properly in quirks mode. Print out an error, and
	// disable rendering.
	if (typeof document !== "undefined") {
	    if (document.compatMode !== "CSS1Compat") {
	        typeof console !== "undefined" && console.warn(
	            "Warning: KaTeX doesn't work in quirks mode. Make sure your " +
	                "website has a suitable doctype.");

	        render = function() {
	            throw new ParseError("KaTeX doesn't work in quirks mode.");
	        };
	    }
	}

	/**
	 * Parse and build an expression, and return the markup for that.
	 */
	var renderToString = function(expression, options) {
	    var settings = new Settings(options);

	    var tree = parseTree(expression, settings);
	    return buildTree(tree, expression, settings).toMarkup();
	};

	/**
	 * Parse an expression and return the parse tree.
	 */
	var generateParseTree = function(expression, options) {
	    var settings = new Settings(options);
	    return parseTree(expression, settings);
	};

	module.exports = {
	    render: render,
	    renderToString: renderToString,
	    /**
	     * NOTE: This method is not currently recommended for public use.
	     * The internal tree representation is unstable and is very likely
	     * to change. Use at your own risk.
	     */
	    __parse: generateParseTree,
	    ParseError: ParseError,
	};


/***/ },
/* 72 */
/***/ function(module, exports) {

	/**
	 * This is the ParseError class, which is the main error thrown by KaTeX
	 * functions when something has gone wrong. This is used to distinguish internal
	 * errors from errors in the expression that the user provided.
	 */
	function ParseError(message, lexer, position) {
	    var error = "KaTeX parse error: " + message;

	    if (lexer !== undefined && position !== undefined) {
	        // If we have the input and a position, make the error a bit fancier

	        // Prepend some information
	        error += " at position " + position + ": ";

	        // Get the input
	        var input = lexer._input;
	        // Insert a combining underscore at the correct position
	        input = input.slice(0, position) + "\u0332" +
	            input.slice(position);

	        // Extract some context from the input and add it to the error
	        var begin = Math.max(0, position - 15);
	        var end = position + 15;
	        error += input.slice(begin, end);
	    }

	    // Some hackery to make ParseError a prototype of Error
	    // See http://stackoverflow.com/a/8460753
	    var self = new Error(error);
	    self.name = "ParseError";
	    self.__proto__ = ParseError.prototype;

	    self.position = position;
	    return self;
	}

	// More hackery
	ParseError.prototype.__proto__ = Error.prototype;

	module.exports = ParseError;


/***/ },
/* 73 */
/***/ function(module, exports) {

	/**
	 * This is a module for storing settings passed into KaTeX. It correctly handles
	 * default settings.
	 */

	/**
	 * Helper function for getting a default value if the value is undefined
	 */
	function get(option, defaultValue) {
	    return option === undefined ? defaultValue : option;
	}

	/**
	 * The main Settings object
	 *
	 * The current options stored are:
	 *  - displayMode: Whether the expression should be typeset by default in
	 *                 textstyle or displaystyle (default false)
	 */
	function Settings(options) {
	    // allow null options
	    options = options || {};
	    this.displayMode = get(options.displayMode, false);
	    this.throwOnError = get(options.throwOnError, true);
	    this.errorColor = get(options.errorColor, "#cc0000");
	}

	module.exports = Settings;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var buildHTML = __webpack_require__(75);
	var buildMathML = __webpack_require__(84);
	var buildCommon = __webpack_require__(77);
	var Options = __webpack_require__(86);
	var Settings = __webpack_require__(73);
	var Style = __webpack_require__(76);

	var makeSpan = buildCommon.makeSpan;

	var buildTree = function(tree, expression, settings) {
	    settings = settings || new Settings({});

	    var startStyle = Style.TEXT;
	    if (settings.displayMode) {
	        startStyle = Style.DISPLAY;
	    }

	    // Setup the default options
	    var options = new Options({
	        style: startStyle,
	        size: "size5",
	    });

	    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
	    // ords), so we build the MathML version first.
	    var mathMLNode = buildMathML(tree, expression, options);
	    var htmlNode = buildHTML(tree, options);

	    var katexNode = makeSpan(["katex"], [
	        mathMLNode, htmlNode,
	    ]);

	    if (settings.displayMode) {
	        return makeSpan(["katex-display"], [katexNode]);
	    } else {
	        return katexNode;
	    }
	};

	module.exports = buildTree;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-console:0 */
	/**
	 * This file does the main work of building a domTree structure from a parse
	 * tree. The entry point is the `buildHTML` function, which takes a parse tree.
	 * Then, the buildExpression, buildGroup, and various groupTypes functions are
	 * called, to produce a final HTML tree.
	 */

	var ParseError = __webpack_require__(72);
	var Style = __webpack_require__(76);

	var buildCommon = __webpack_require__(77);
	var delimiter = __webpack_require__(83);
	var domTree = __webpack_require__(78);
	var fontMetrics = __webpack_require__(80);
	var utils = __webpack_require__(79);

	var makeSpan = buildCommon.makeSpan;

	/**
	 * Take a list of nodes, build them in order, and return a list of the built
	 * nodes. This function handles the `prev` node correctly, and passes the
	 * previous element from the list as the prev of the next element.
	 */
	var buildExpression = function(expression, options, prev) {
	    var groups = [];
	    for (var i = 0; i < expression.length; i++) {
	        var group = expression[i];
	        groups.push(buildGroup(group, options, prev));
	        prev = group;
	    }
	    return groups;
	};

	// List of types used by getTypeOfGroup,
	// see https://github.com/Khan/KaTeX/wiki/Examining-TeX#group-types
	var groupToType = {
	    mathord: "mord",
	    textord: "mord",
	    bin: "mbin",
	    rel: "mrel",
	    text: "mord",
	    open: "mopen",
	    close: "mclose",
	    inner: "minner",
	    genfrac: "mord",
	    array: "mord",
	    spacing: "mord",
	    punct: "mpunct",
	    ordgroup: "mord",
	    op: "mop",
	    katex: "mord",
	    overline: "mord",
	    underline: "mord",
	    rule: "mord",
	    leftright: "minner",
	    sqrt: "mord",
	    accent: "mord",
	};

	/**
	 * Gets the final math type of an expression, given its group type. This type is
	 * used to determine spacing between elements, and affects bin elements by
	 * causing them to change depending on what types are around them. This type
	 * must be attached to the outermost node of an element as a CSS class so that
	 * spacing with its surrounding elements works correctly.
	 *
	 * Some elements can be mapped one-to-one from group type to math type, and
	 * those are listed in the `groupToType` table.
	 *
	 * Others (usually elements that wrap around other elements) often have
	 * recursive definitions, and thus call `getTypeOfGroup` on their inner
	 * elements.
	 */
	var getTypeOfGroup = function(group) {
	    if (group == null) {
	        // Like when typesetting $^3$
	        return groupToType.mathord;
	    } else if (group.type === "supsub") {
	        return getTypeOfGroup(group.value.base);
	    } else if (group.type === "llap" || group.type === "rlap") {
	        return getTypeOfGroup(group.value);
	    } else if (group.type === "color") {
	        return getTypeOfGroup(group.value.value);
	    } else if (group.type === "sizing") {
	        return getTypeOfGroup(group.value.value);
	    } else if (group.type === "styling") {
	        return getTypeOfGroup(group.value.value);
	    } else if (group.type === "delimsizing") {
	        return groupToType[group.value.delimType];
	    } else {
	        return groupToType[group.type];
	    }
	};

	/**
	 * Sometimes, groups perform special rules when they have superscripts or
	 * subscripts attached to them. This function lets the `supsub` group know that
	 * its inner element should handle the superscripts and subscripts instead of
	 * handling them itself.
	 */
	var shouldHandleSupSub = function(group, options) {
	    if (!group) {
	        return false;
	    } else if (group.type === "op") {
	        // Operators handle supsubs differently when they have limits
	        // (e.g. `\displaystyle\sum_2^3`)
	        return group.value.limits &&
	            (options.style.size === Style.DISPLAY.size ||
	            group.value.alwaysHandleSupSub);
	    } else if (group.type === "accent") {
	        return isCharacterBox(group.value.base);
	    } else {
	        return null;
	    }
	};

	/**
	 * Sometimes we want to pull out the innermost element of a group. In most
	 * cases, this will just be the group itself, but when ordgroups and colors have
	 * a single element, we want to pull that out.
	 */
	var getBaseElem = function(group) {
	    if (!group) {
	        return false;
	    } else if (group.type === "ordgroup") {
	        if (group.value.length === 1) {
	            return getBaseElem(group.value[0]);
	        } else {
	            return group;
	        }
	    } else if (group.type === "color") {
	        if (group.value.value.length === 1) {
	            return getBaseElem(group.value.value[0]);
	        } else {
	            return group;
	        }
	    } else {
	        return group;
	    }
	};

	/**
	 * TeXbook algorithms often reference "character boxes", which are simply groups
	 * with a single character in them. To decide if something is a character box,
	 * we find its innermost group, and see if it is a single character.
	 */
	var isCharacterBox = function(group) {
	    var baseElem = getBaseElem(group);

	    // These are all they types of groups which hold single characters
	    return baseElem.type === "mathord" ||
	        baseElem.type === "textord" ||
	        baseElem.type === "bin" ||
	        baseElem.type === "rel" ||
	        baseElem.type === "inner" ||
	        baseElem.type === "open" ||
	        baseElem.type === "close" ||
	        baseElem.type === "punct";
	};

	var makeNullDelimiter = function(options) {
	    return makeSpan([
	        "sizing", "reset-" + options.size, "size5",
	        options.style.reset(), Style.TEXT.cls(),
	        "nulldelimiter",
	    ]);
	};

	/**
	 * This is a map of group types to the function used to handle that type.
	 * Simpler types come at the beginning, while complicated types come afterwards.
	 */
	var groupTypes = {};

	groupTypes.mathord = function(group, options, prev) {
	    return buildCommon.makeOrd(group, options, "mathord");
	};

	groupTypes.textord = function(group, options, prev) {
	    return buildCommon.makeOrd(group, options, "textord");
	};

	groupTypes.bin = function(group, options, prev) {
	    var className = "mbin";
	    // Pull out the most recent element. Do some special handling to find
	    // things at the end of a \color group. Note that we don't use the same
	    // logic for ordgroups (which count as ords).
	    var prevAtom = prev;
	    while (prevAtom && prevAtom.type === "color") {
	        var atoms = prevAtom.value.value;
	        prevAtom = atoms[atoms.length - 1];
	    }
	    // See TeXbook pg. 442-446, Rules 5 and 6, and the text before Rule 19.
	    // Here, we determine whether the bin should turn into an ord. We
	    // currently only apply Rule 5.
	    if (!prev || utils.contains(["mbin", "mopen", "mrel", "mop", "mpunct"],
	            getTypeOfGroup(prevAtom))) {
	        group.type = "textord";
	        className = "mord";
	    }

	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), [className]);
	};

	groupTypes.rel = function(group, options, prev) {
	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), ["mrel"]);
	};

	groupTypes.open = function(group, options, prev) {
	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), ["mopen"]);
	};

	groupTypes.close = function(group, options, prev) {
	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), ["mclose"]);
	};

	groupTypes.inner = function(group, options, prev) {
	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), ["minner"]);
	};

	groupTypes.punct = function(group, options, prev) {
	    return buildCommon.mathsym(
	        group.value, group.mode, options.getColor(), ["mpunct"]);
	};

	groupTypes.ordgroup = function(group, options, prev) {
	    return makeSpan(
	        ["mord", options.style.cls()],
	        buildExpression(group.value, options.reset())
	    );
	};

	groupTypes.text = function(group, options, prev) {
	    return makeSpan(["text", "mord", options.style.cls()],
	        buildExpression(group.value.body, options.reset()));
	};

	groupTypes.color = function(group, options, prev) {
	    var elements = buildExpression(
	        group.value.value,
	        options.withColor(group.value.color),
	        prev
	    );

	    // \color isn't supposed to affect the type of the elements it contains.
	    // To accomplish this, we wrap the results in a fragment, so the inner
	    // elements will be able to directly interact with their neighbors. For
	    // example, `\color{red}{2 +} 3` has the same spacing as `2 + 3`
	    return new buildCommon.makeFragment(elements);
	};

	groupTypes.supsub = function(group, options, prev) {
	    // Superscript and subscripts are handled in the TeXbook on page
	    // 445-446, rules 18(a-f).

	    // Here is where we defer to the inner group if it should handle
	    // superscripts and subscripts itself.
	    if (shouldHandleSupSub(group.value.base, options)) {
	        return groupTypes[group.value.base.type](group, options, prev);
	    }

	    var base = buildGroup(group.value.base, options.reset());
	    var supmid;
	    var submid;
	    var sup;
	    var sub;

	    if (group.value.sup) {
	        sup = buildGroup(group.value.sup,
	                options.withStyle(options.style.sup()));
	        supmid = makeSpan(
	                [options.style.reset(), options.style.sup().cls()], [sup]);
	    }

	    if (group.value.sub) {
	        sub = buildGroup(group.value.sub,
	                options.withStyle(options.style.sub()));
	        submid = makeSpan(
	                [options.style.reset(), options.style.sub().cls()], [sub]);
	    }

	    // Rule 18a
	    var supShift;
	    var subShift;
	    if (isCharacterBox(group.value.base)) {
	        supShift = 0;
	        subShift = 0;
	    } else {
	        supShift = base.height - fontMetrics.metrics.supDrop;
	        subShift = base.depth + fontMetrics.metrics.subDrop;
	    }

	    // Rule 18c
	    var minSupShift;
	    if (options.style === Style.DISPLAY) {
	        minSupShift = fontMetrics.metrics.sup1;
	    } else if (options.style.cramped) {
	        minSupShift = fontMetrics.metrics.sup3;
	    } else {
	        minSupShift = fontMetrics.metrics.sup2;
	    }

	    // scriptspace is a font-size-independent size, so scale it
	    // appropriately
	    var multiplier = Style.TEXT.sizeMultiplier *
	            options.style.sizeMultiplier;
	    var scriptspace =
	        (0.5 / fontMetrics.metrics.ptPerEm) / multiplier + "em";

	    var supsub;
	    if (!group.value.sup) {
	        // Rule 18b
	        subShift = Math.max(
	            subShift, fontMetrics.metrics.sub1,
	            sub.height - 0.8 * fontMetrics.metrics.xHeight);

	        supsub = buildCommon.makeVList([
	            {type: "elem", elem: submid},
	        ], "shift", subShift, options);

	        supsub.children[0].style.marginRight = scriptspace;

	        // Subscripts shouldn't be shifted by the base's italic correction.
	        // Account for that by shifting the subscript back the appropriate
	        // amount. Note we only do this when the base is a single symbol.
	        if (base instanceof domTree.symbolNode) {
	            supsub.children[0].style.marginLeft = -base.italic + "em";
	        }
	    } else if (!group.value.sub) {
	        // Rule 18c, d
	        supShift = Math.max(supShift, minSupShift,
	            sup.depth + 0.25 * fontMetrics.metrics.xHeight);

	        supsub = buildCommon.makeVList([
	            {type: "elem", elem: supmid},
	        ], "shift", -supShift, options);

	        supsub.children[0].style.marginRight = scriptspace;
	    } else {
	        supShift = Math.max(
	            supShift, minSupShift,
	            sup.depth + 0.25 * fontMetrics.metrics.xHeight);
	        subShift = Math.max(subShift, fontMetrics.metrics.sub2);

	        var ruleWidth = fontMetrics.metrics.defaultRuleThickness;

	        // Rule 18e
	        if ((supShift - sup.depth) - (sub.height - subShift) <
	                4 * ruleWidth) {
	            subShift = 4 * ruleWidth - (supShift - sup.depth) + sub.height;
	            var psi = 0.8 * fontMetrics.metrics.xHeight -
	                (supShift - sup.depth);
	            if (psi > 0) {
	                supShift += psi;
	                subShift -= psi;
	            }
	        }

	        supsub = buildCommon.makeVList([
	            {type: "elem", elem: submid, shift: subShift},
	            {type: "elem", elem: supmid, shift: -supShift},
	        ], "individualShift", null, options);

	        // See comment above about subscripts not being shifted
	        if (base instanceof domTree.symbolNode) {
	            supsub.children[0].style.marginLeft = -base.italic + "em";
	        }

	        supsub.children[0].style.marginRight = scriptspace;
	        supsub.children[1].style.marginRight = scriptspace;
	    }

	    return makeSpan([getTypeOfGroup(group.value.base)],
	        [base, supsub]);
	};

	groupTypes.genfrac = function(group, options, prev) {
	    // Fractions are handled in the TeXbook on pages 444-445, rules 15(a-e).
	    // Figure out what style this fraction should be in based on the
	    // function used
	    var fstyle = options.style;
	    if (group.value.size === "display") {
	        fstyle = Style.DISPLAY;
	    } else if (group.value.size === "text") {
	        fstyle = Style.TEXT;
	    }

	    var nstyle = fstyle.fracNum();
	    var dstyle = fstyle.fracDen();

	    var numer = buildGroup(group.value.numer, options.withStyle(nstyle));
	    var numerreset = makeSpan([fstyle.reset(), nstyle.cls()], [numer]);

	    var denom = buildGroup(group.value.denom, options.withStyle(dstyle));
	    var denomreset = makeSpan([fstyle.reset(), dstyle.cls()], [denom]);

	    var ruleWidth;
	    if (group.value.hasBarLine) {
	        ruleWidth = fontMetrics.metrics.defaultRuleThickness /
	            options.style.sizeMultiplier;
	    } else {
	        ruleWidth = 0;
	    }

	    // Rule 15b
	    var numShift;
	    var clearance;
	    var denomShift;
	    if (fstyle.size === Style.DISPLAY.size) {
	        numShift = fontMetrics.metrics.num1;
	        if (ruleWidth > 0) {
	            clearance = 3 * ruleWidth;
	        } else {
	            clearance = 7 * fontMetrics.metrics.defaultRuleThickness;
	        }
	        denomShift = fontMetrics.metrics.denom1;
	    } else {
	        if (ruleWidth > 0) {
	            numShift = fontMetrics.metrics.num2;
	            clearance = ruleWidth;
	        } else {
	            numShift = fontMetrics.metrics.num3;
	            clearance = 3 * fontMetrics.metrics.defaultRuleThickness;
	        }
	        denomShift = fontMetrics.metrics.denom2;
	    }

	    var frac;
	    if (ruleWidth === 0) {
	        // Rule 15c
	        var candiateClearance =
	            (numShift - numer.depth) - (denom.height - denomShift);
	        if (candiateClearance < clearance) {
	            numShift += 0.5 * (clearance - candiateClearance);
	            denomShift += 0.5 * (clearance - candiateClearance);
	        }

	        frac = buildCommon.makeVList([
	            {type: "elem", elem: denomreset, shift: denomShift},
	            {type: "elem", elem: numerreset, shift: -numShift},
	        ], "individualShift", null, options);
	    } else {
	        // Rule 15d
	        var axisHeight = fontMetrics.metrics.axisHeight;

	        if ((numShift - numer.depth) - (axisHeight + 0.5 * ruleWidth) <
	                clearance) {
	            numShift +=
	                clearance - ((numShift - numer.depth) -
	                             (axisHeight + 0.5 * ruleWidth));
	        }

	        if ((axisHeight - 0.5 * ruleWidth) - (denom.height - denomShift) <
	                clearance) {
	            denomShift +=
	                clearance - ((axisHeight - 0.5 * ruleWidth) -
	                             (denom.height - denomShift));
	        }

	        var mid = makeSpan(
	            [options.style.reset(), Style.TEXT.cls(), "frac-line"]);
	        // Manually set the height of the line because its height is
	        // created in CSS
	        mid.height = ruleWidth;

	        var midShift = -(axisHeight - 0.5 * ruleWidth);

	        frac = buildCommon.makeVList([
	            {type: "elem", elem: denomreset, shift: denomShift},
	            {type: "elem", elem: mid,        shift: midShift},
	            {type: "elem", elem: numerreset, shift: -numShift},
	        ], "individualShift", null, options);
	    }

	    // Since we manually change the style sometimes (with \dfrac or \tfrac),
	    // account for the possible size change here.
	    frac.height *= fstyle.sizeMultiplier / options.style.sizeMultiplier;
	    frac.depth *= fstyle.sizeMultiplier / options.style.sizeMultiplier;

	    // Rule 15e
	    var delimSize;
	    if (fstyle.size === Style.DISPLAY.size) {
	        delimSize = fontMetrics.metrics.delim1;
	    } else {
	        delimSize = fontMetrics.metrics.getDelim2(fstyle);
	    }

	    var leftDelim;
	    var rightDelim;
	    if (group.value.leftDelim == null) {
	        leftDelim = makeNullDelimiter(options);
	    } else {
	        leftDelim = delimiter.customSizedDelim(
	            group.value.leftDelim, delimSize, true,
	            options.withStyle(fstyle), group.mode);
	    }
	    if (group.value.rightDelim == null) {
	        rightDelim = makeNullDelimiter(options);
	    } else {
	        rightDelim = delimiter.customSizedDelim(
	            group.value.rightDelim, delimSize, true,
	            options.withStyle(fstyle), group.mode);
	    }

	    return makeSpan(
	        ["mord", options.style.reset(), fstyle.cls()],
	        [leftDelim, makeSpan(["mfrac"], [frac]), rightDelim],
	        options.getColor());
	};

	groupTypes.array = function(group, options, prev) {
	    var r;
	    var c;
	    var nr = group.value.body.length;
	    var nc = 0;
	    var body = new Array(nr);

	    // Horizontal spacing
	    var pt = 1 / fontMetrics.metrics.ptPerEm;
	    var arraycolsep = 5 * pt; // \arraycolsep in article.cls

	    // Vertical spacing
	    var baselineskip = 12 * pt; // see size10.clo
	    // Default \arraystretch from lttab.dtx
	    // TODO(gagern): may get redefined once we have user-defined macros
	    var arraystretch = utils.deflt(group.value.arraystretch, 1);
	    var arrayskip = arraystretch * baselineskip;
	    var arstrutHeight = 0.7 * arrayskip; // \strutbox in ltfsstrc.dtx and
	    var arstrutDepth = 0.3 * arrayskip;  // \@arstrutbox in lttab.dtx

	    var totalHeight = 0;
	    for (r = 0; r < group.value.body.length; ++r) {
	        var inrow = group.value.body[r];
	        var height = arstrutHeight; // \@array adds an \@arstrut
	        var depth = arstrutDepth;   // to each tow (via the template)

	        if (nc < inrow.length) {
	            nc = inrow.length;
	        }

	        var outrow = new Array(inrow.length);
	        for (c = 0; c < inrow.length; ++c) {
	            var elt = buildGroup(inrow[c], options);
	            if (depth < elt.depth) {
	                depth = elt.depth;
	            }
	            if (height < elt.height) {
	                height = elt.height;
	            }
	            outrow[c] = elt;
	        }

	        var gap = 0;
	        if (group.value.rowGaps[r]) {
	            gap = group.value.rowGaps[r].value;
	            switch (gap.unit) {
	                case "em":
	                    gap = gap.number;
	                    break;
	                case "ex":
	                    gap = gap.number * fontMetrics.metrics.emPerEx;
	                    break;
	                default:
	                    console.error("Can't handle unit " + gap.unit);
	                    gap = 0;
	            }
	            if (gap > 0) { // \@argarraycr
	                gap += arstrutDepth;
	                if (depth < gap) {
	                    depth = gap; // \@xargarraycr
	                }
	                gap = 0;
	            }
	        }

	        outrow.height = height;
	        outrow.depth = depth;
	        totalHeight += height;
	        outrow.pos = totalHeight;
	        totalHeight += depth + gap; // \@yargarraycr
	        body[r] = outrow;
	    }

	    var offset = totalHeight / 2 + fontMetrics.metrics.axisHeight;
	    var colDescriptions = group.value.cols || [];
	    var cols = [];
	    var colSep;
	    var colDescrNum;
	    for (c = 0, colDescrNum = 0;
	         // Continue while either there are more columns or more column
	         // descriptions, so trailing separators don't get lost.
	         c < nc || colDescrNum < colDescriptions.length;
	         ++c, ++colDescrNum) {

	        var colDescr = colDescriptions[colDescrNum] || {};

	        var firstSeparator = true;
	        while (colDescr.type === "separator") {
	            // If there is more than one separator in a row, add a space
	            // between them.
	            if (!firstSeparator) {
	                colSep = makeSpan(["arraycolsep"], []);
	                colSep.style.width =
	                    fontMetrics.metrics.doubleRuleSep + "em";
	                cols.push(colSep);
	            }

	            if (colDescr.separator === "|") {
	                var separator = makeSpan(
	                    ["vertical-separator"],
	                    []);
	                separator.style.height = totalHeight + "em";
	                separator.style.verticalAlign =
	                    -(totalHeight - offset) + "em";

	                cols.push(separator);
	            } else {
	                throw new ParseError(
	                    "Invalid separator type: " + colDescr.separator);
	            }

	            colDescrNum++;
	            colDescr = colDescriptions[colDescrNum] || {};
	            firstSeparator = false;
	        }

	        if (c >= nc) {
	            continue;
	        }

	        var sepwidth;
	        if (c > 0 || group.value.hskipBeforeAndAfter) {
	            sepwidth = utils.deflt(colDescr.pregap, arraycolsep);
	            if (sepwidth !== 0) {
	                colSep = makeSpan(["arraycolsep"], []);
	                colSep.style.width = sepwidth + "em";
	                cols.push(colSep);
	            }
	        }

	        var col = [];
	        for (r = 0; r < nr; ++r) {
	            var row = body[r];
	            var elem = row[c];
	            if (!elem) {
	                continue;
	            }
	            var shift = row.pos - offset;
	            elem.depth = row.depth;
	            elem.height = row.height;
	            col.push({type: "elem", elem: elem, shift: shift});
	        }

	        col = buildCommon.makeVList(col, "individualShift", null, options);
	        col = makeSpan(
	            ["col-align-" + (colDescr.align || "c")],
	            [col]);
	        cols.push(col);

	        if (c < nc - 1 || group.value.hskipBeforeAndAfter) {
	            sepwidth = utils.deflt(colDescr.postgap, arraycolsep);
	            if (sepwidth !== 0) {
	                colSep = makeSpan(["arraycolsep"], []);
	                colSep.style.width = sepwidth + "em";
	                cols.push(colSep);
	            }
	        }
	    }
	    body = makeSpan(["mtable"], cols);
	    return makeSpan(["mord"], [body], options.getColor());
	};

	groupTypes.spacing = function(group, options, prev) {
	    if (group.value === "\\ " || group.value === "\\space" ||
	        group.value === " " || group.value === "~") {
	        // Spaces are generated by adding an actual space. Each of these
	        // things has an entry in the symbols table, so these will be turned
	        // into appropriate outputs.
	        return makeSpan(
	            ["mord", "mspace"],
	            [buildCommon.mathsym(group.value, group.mode)]
	        );
	    } else {
	        // Other kinds of spaces are of arbitrary width. We use CSS to
	        // generate these.
	        return makeSpan(
	            ["mord", "mspace",
	             buildCommon.spacingFunctions[group.value].className]);
	    }
	};

	groupTypes.llap = function(group, options, prev) {
	    var inner = makeSpan(
	        ["inner"], [buildGroup(group.value.body, options.reset())]);
	    var fix = makeSpan(["fix"], []);
	    return makeSpan(
	        ["llap", options.style.cls()], [inner, fix]);
	};

	groupTypes.rlap = function(group, options, prev) {
	    var inner = makeSpan(
	        ["inner"], [buildGroup(group.value.body, options.reset())]);
	    var fix = makeSpan(["fix"], []);
	    return makeSpan(
	        ["rlap", options.style.cls()], [inner, fix]);
	};

	groupTypes.op = function(group, options, prev) {
	    // Operators are handled in the TeXbook pg. 443-444, rule 13(a).
	    var supGroup;
	    var subGroup;
	    var hasLimits = false;
	    if (group.type === "supsub" ) {
	        // If we have limits, supsub will pass us its group to handle. Pull
	        // out the superscript and subscript and set the group to the op in
	        // its base.
	        supGroup = group.value.sup;
	        subGroup = group.value.sub;
	        group = group.value.base;
	        hasLimits = true;
	    }

	    // Most operators have a large successor symbol, but these don't.
	    var noSuccessor = [
	        "\\smallint",
	    ];

	    var large = false;
	    if (options.style.size === Style.DISPLAY.size &&
	        group.value.symbol &&
	        !utils.contains(noSuccessor, group.value.body)) {

	        // Most symbol operators get larger in displaystyle (rule 13)
	        large = true;
	    }

	    var base;
	    var baseShift = 0;
	    var slant = 0;
	    if (group.value.symbol) {
	        // If this is a symbol, create the symbol.
	        var style = large ? "Size2-Regular" : "Size1-Regular";
	        base = buildCommon.makeSymbol(
	            group.value.body, style, "math", options.getColor(),
	            ["op-symbol", large ? "large-op" : "small-op", "mop"]);

	        // Shift the symbol so its center lies on the axis (rule 13). It
	        // appears that our fonts have the centers of the symbols already
	        // almost on the axis, so these numbers are very small. Note we
	        // don't actually apply this here, but instead it is used either in
	        // the vlist creation or separately when there are no limits.
	        baseShift = (base.height - base.depth) / 2 -
	            fontMetrics.metrics.axisHeight *
	            options.style.sizeMultiplier;

	        // The slant of the symbol is just its italic correction.
	        slant = base.italic;
	    } else {
	        // Otherwise, this is a text operator. Build the text from the
	        // operator's name.
	        // TODO(emily): Add a space in the middle of some of these
	        // operators, like \limsup
	        var output = [];
	        for (var i = 1; i < group.value.body.length; i++) {
	            output.push(buildCommon.mathsym(group.value.body[i], group.mode));
	        }
	        base = makeSpan(["mop"], output, options.getColor());
	    }

	    if (hasLimits) {
	        // IE 8 clips \int if it is in a display: inline-block. We wrap it
	        // in a new span so it is an inline, and works.
	        base = makeSpan([], [base]);

	        var supmid;
	        var supKern;
	        var submid;
	        var subKern;
	        // We manually have to handle the superscripts and subscripts. This,
	        // aside from the kern calculations, is copied from supsub.
	        if (supGroup) {
	            var sup = buildGroup(
	                supGroup, options.withStyle(options.style.sup()));
	            supmid = makeSpan(
	                [options.style.reset(), options.style.sup().cls()], [sup]);

	            supKern = Math.max(
	                fontMetrics.metrics.bigOpSpacing1,
	                fontMetrics.metrics.bigOpSpacing3 - sup.depth);
	        }

	        if (subGroup) {
	            var sub = buildGroup(
	                subGroup, options.withStyle(options.style.sub()));
	            submid = makeSpan(
	                [options.style.reset(), options.style.sub().cls()],
	                [sub]);

	            subKern = Math.max(
	                fontMetrics.metrics.bigOpSpacing2,
	                fontMetrics.metrics.bigOpSpacing4 - sub.height);
	        }

	        // Build the final group as a vlist of the possible subscript, base,
	        // and possible superscript.
	        var finalGroup;
	        var top;
	        var bottom;
	        if (!supGroup) {
	            top = base.height - baseShift;

	            finalGroup = buildCommon.makeVList([
	                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
	                {type: "elem", elem: submid},
	                {type: "kern", size: subKern},
	                {type: "elem", elem: base},
	            ], "top", top, options);

	            // Here, we shift the limits by the slant of the symbol. Note
	            // that we are supposed to shift the limits by 1/2 of the slant,
	            // but since we are centering the limits adding a full slant of
	            // margin will shift by 1/2 that.
	            finalGroup.children[0].style.marginLeft = -slant + "em";
	        } else if (!subGroup) {
	            bottom = base.depth + baseShift;

	            finalGroup = buildCommon.makeVList([
	                {type: "elem", elem: base},
	                {type: "kern", size: supKern},
	                {type: "elem", elem: supmid},
	                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
	            ], "bottom", bottom, options);

	            // See comment above about slants
	            finalGroup.children[1].style.marginLeft = slant + "em";
	        } else if (!supGroup && !subGroup) {
	            // This case probably shouldn't occur (this would mean the
	            // supsub was sending us a group with no superscript or
	            // subscript) but be safe.
	            return base;
	        } else {
	            bottom = fontMetrics.metrics.bigOpSpacing5 +
	                submid.height + submid.depth +
	                subKern +
	                base.depth + baseShift;

	            finalGroup = buildCommon.makeVList([
	                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
	                {type: "elem", elem: submid},
	                {type: "kern", size: subKern},
	                {type: "elem", elem: base},
	                {type: "kern", size: supKern},
	                {type: "elem", elem: supmid},
	                {type: "kern", size: fontMetrics.metrics.bigOpSpacing5},
	            ], "bottom", bottom, options);

	            // See comment above about slants
	            finalGroup.children[0].style.marginLeft = -slant + "em";
	            finalGroup.children[2].style.marginLeft = slant + "em";
	        }

	        return makeSpan(["mop", "op-limits"], [finalGroup]);
	    } else {
	        if (group.value.symbol) {
	            base.style.top = baseShift + "em";
	        }

	        return base;
	    }
	};

	groupTypes.katex = function(group, options, prev) {
	    // The KaTeX logo. The offsets for the K and a were chosen to look
	    // good, but the offsets for the T, E, and X were taken from the
	    // definition of \TeX in TeX (see TeXbook pg. 356)
	    var k = makeSpan(
	        ["k"], [buildCommon.mathsym("K", group.mode)]);
	    var a = makeSpan(
	        ["a"], [buildCommon.mathsym("A", group.mode)]);

	    a.height = (a.height + 0.2) * 0.75;
	    a.depth = (a.height - 0.2) * 0.75;

	    var t = makeSpan(
	        ["t"], [buildCommon.mathsym("T", group.mode)]);
	    var e = makeSpan(
	        ["e"], [buildCommon.mathsym("E", group.mode)]);

	    e.height = (e.height - 0.2155);
	    e.depth = (e.depth + 0.2155);

	    var x = makeSpan(
	        ["x"], [buildCommon.mathsym("X", group.mode)]);

	    return makeSpan(
	        ["katex-logo", "mord"], [k, a, t, e, x], options.getColor());
	};

	groupTypes.overline = function(group, options, prev) {
	    // Overlines are handled in the TeXbook pg 443, Rule 9.

	    // Build the inner group in the cramped style.
	    var innerGroup = buildGroup(group.value.body,
	            options.withStyle(options.style.cramp()));

	    var ruleWidth = fontMetrics.metrics.defaultRuleThickness /
	        options.style.sizeMultiplier;

	    // Create the line above the body
	    var line = makeSpan(
	        [options.style.reset(), Style.TEXT.cls(), "overline-line"]);
	    line.height = ruleWidth;
	    line.maxFontSize = 1.0;

	    // Generate the vlist, with the appropriate kerns
	    var vlist = buildCommon.makeVList([
	        {type: "elem", elem: innerGroup},
	        {type: "kern", size: 3 * ruleWidth},
	        {type: "elem", elem: line},
	        {type: "kern", size: ruleWidth},
	    ], "firstBaseline", null, options);

	    return makeSpan(["overline", "mord"], [vlist], options.getColor());
	};

	groupTypes.underline = function(group, options, prev) {
	    // Underlines are handled in the TeXbook pg 443, Rule 10.

	    // Build the inner group.
	    var innerGroup = buildGroup(group.value.body, options);

	    var ruleWidth = fontMetrics.metrics.defaultRuleThickness /
	        options.style.sizeMultiplier;

	    // Create the line above the body
	    var line = makeSpan(
	        [options.style.reset(), Style.TEXT.cls(), "underline-line"]);
	    line.height = ruleWidth;
	    line.maxFontSize = 1.0;

	    // Generate the vlist, with the appropriate kerns
	    var vlist = buildCommon.makeVList([
	        {type: "kern", size: ruleWidth},
	        {type: "elem", elem: line},
	        {type: "kern", size: 3 * ruleWidth},
	        {type: "elem", elem: innerGroup},
	    ], "top", innerGroup.height, options);

	    return makeSpan(["underline", "mord"], [vlist], options.getColor());
	};

	groupTypes.sqrt = function(group, options, prev) {
	    // Square roots are handled in the TeXbook pg. 443, Rule 11.

	    // First, we do the same steps as in overline to build the inner group
	    // and line
	    var inner = buildGroup(group.value.body,
	            options.withStyle(options.style.cramp()));

	    var ruleWidth = fontMetrics.metrics.defaultRuleThickness /
	        options.style.sizeMultiplier;

	    var line = makeSpan(
	        [options.style.reset(), Style.TEXT.cls(), "sqrt-line"], [],
	        options.getColor());
	    line.height = ruleWidth;
	    line.maxFontSize = 1.0;

	    var phi = ruleWidth;
	    if (options.style.id < Style.TEXT.id) {
	        phi = fontMetrics.metrics.xHeight;
	    }

	    // Calculate the clearance between the body and line
	    var lineClearance = ruleWidth + phi / 4;

	    var innerHeight =
	        (inner.height + inner.depth) * options.style.sizeMultiplier;
	    var minDelimiterHeight = innerHeight + lineClearance + ruleWidth;

	    // Create a \surd delimiter of the required minimum size
	    var delim = makeSpan(["sqrt-sign"], [
	        delimiter.customSizedDelim("\\surd", minDelimiterHeight,
	                                   false, options, group.mode)],
	                         options.getColor());

	    var delimDepth = (delim.height + delim.depth) - ruleWidth;

	    // Adjust the clearance based on the delimiter size
	    if (delimDepth > inner.height + inner.depth + lineClearance) {
	        lineClearance =
	            (lineClearance + delimDepth - inner.height - inner.depth) / 2;
	    }

	    // Shift the delimiter so that its top lines up with the top of the line
	    var delimShift = -(inner.height + lineClearance + ruleWidth) + delim.height;
	    delim.style.top = delimShift + "em";
	    delim.height -= delimShift;
	    delim.depth += delimShift;

	    // We add a special case here, because even when `inner` is empty, we
	    // still get a line. So, we use a simple heuristic to decide if we
	    // should omit the body entirely. (note this doesn't work for something
	    // like `\sqrt{\rlap{x}}`, but if someone is doing that they deserve for
	    // it not to work.
	    var body;
	    if (inner.height === 0 && inner.depth === 0) {
	        body = makeSpan();
	    } else {
	        body = buildCommon.makeVList([
	            {type: "elem", elem: inner},
	            {type: "kern", size: lineClearance},
	            {type: "elem", elem: line},
	            {type: "kern", size: ruleWidth},
	        ], "firstBaseline", null, options);
	    }

	    if (!group.value.index) {
	        return makeSpan(["sqrt", "mord"], [delim, body]);
	    } else {
	        // Handle the optional root index

	        // The index is always in scriptscript style
	        var root = buildGroup(
	            group.value.index,
	            options.withStyle(Style.SCRIPTSCRIPT));
	        var rootWrap = makeSpan(
	            [options.style.reset(), Style.SCRIPTSCRIPT.cls()],
	            [root]);

	        // Figure out the height and depth of the inner part
	        var innerRootHeight = Math.max(delim.height, body.height);
	        var innerRootDepth = Math.max(delim.depth, body.depth);

	        // The amount the index is shifted by. This is taken from the TeX
	        // source, in the definition of `\r@@t`.
	        var toShift = 0.6 * (innerRootHeight - innerRootDepth);

	        // Build a VList with the superscript shifted up correctly
	        var rootVList = buildCommon.makeVList(
	            [{type: "elem", elem: rootWrap}],
	            "shift", -toShift, options);
	        // Add a class surrounding it so we can add on the appropriate
	        // kerning
	        var rootVListWrap = makeSpan(["root"], [rootVList]);

	        return makeSpan(["sqrt", "mord"], [rootVListWrap, delim, body]);
	    }
	};

	groupTypes.sizing = function(group, options, prev) {
	    // Handle sizing operators like \Huge. Real TeX doesn't actually allow
	    // these functions inside of math expressions, so we do some special
	    // handling.
	    var inner = buildExpression(group.value.value,
	            options.withSize(group.value.size), prev);

	    var span = makeSpan(["mord"],
	        [makeSpan(["sizing", "reset-" + options.size, group.value.size,
	                   options.style.cls()],
	                  inner)]);

	    // Calculate the correct maxFontSize manually
	    var fontSize = buildCommon.sizingMultiplier[group.value.size];
	    span.maxFontSize = fontSize * options.style.sizeMultiplier;

	    return span;
	};

	groupTypes.styling = function(group, options, prev) {
	    // Style changes are handled in the TeXbook on pg. 442, Rule 3.

	    // Figure out what style we're changing to.
	    var style = {
	        "display": Style.DISPLAY,
	        "text": Style.TEXT,
	        "script": Style.SCRIPT,
	        "scriptscript": Style.SCRIPTSCRIPT,
	    };

	    var newStyle = style[group.value.style];

	    // Build the inner expression in the new style.
	    var inner = buildExpression(
	        group.value.value, options.withStyle(newStyle), prev);

	    return makeSpan([options.style.reset(), newStyle.cls()], inner);
	};

	groupTypes.font = function(group, options, prev) {
	    var font = group.value.font;
	    return buildGroup(group.value.body, options.withFont(font), prev);
	};

	groupTypes.delimsizing = function(group, options, prev) {
	    var delim = group.value.value;

	    if (delim === ".") {
	        // Empty delimiters still count as elements, even though they don't
	        // show anything.
	        return makeSpan([groupToType[group.value.delimType]]);
	    }

	    // Use delimiter.sizedDelim to generate the delimiter.
	    return makeSpan(
	        [groupToType[group.value.delimType]],
	        [delimiter.sizedDelim(
	            delim, group.value.size, options, group.mode)]);
	};

	groupTypes.leftright = function(group, options, prev) {
	    // Build the inner expression
	    var inner = buildExpression(group.value.body, options.reset());

	    var innerHeight = 0;
	    var innerDepth = 0;

	    // Calculate its height and depth
	    for (var i = 0; i < inner.length; i++) {
	        innerHeight = Math.max(inner[i].height, innerHeight);
	        innerDepth = Math.max(inner[i].depth, innerDepth);
	    }

	    // The size of delimiters is the same, regardless of what style we are
	    // in. Thus, to correctly calculate the size of delimiter we need around
	    // a group, we scale down the inner size based on the size.
	    innerHeight *= options.style.sizeMultiplier;
	    innerDepth *= options.style.sizeMultiplier;

	    var leftDelim;
	    if (group.value.left === ".") {
	        // Empty delimiters in \left and \right make null delimiter spaces.
	        leftDelim = makeNullDelimiter(options);
	    } else {
	        // Otherwise, use leftRightDelim to generate the correct sized
	        // delimiter.
	        leftDelim = delimiter.leftRightDelim(
	            group.value.left, innerHeight, innerDepth, options,
	            group.mode);
	    }
	    // Add it to the beginning of the expression
	    inner.unshift(leftDelim);

	    var rightDelim;
	    // Same for the right delimiter
	    if (group.value.right === ".") {
	        rightDelim = makeNullDelimiter(options);
	    } else {
	        rightDelim = delimiter.leftRightDelim(
	            group.value.right, innerHeight, innerDepth, options,
	            group.mode);
	    }
	    // Add it to the end of the expression.
	    inner.push(rightDelim);

	    return makeSpan(
	        ["minner", options.style.cls()], inner, options.getColor());
	};

	groupTypes.rule = function(group, options, prev) {
	    // Make an empty span for the rule
	    var rule = makeSpan(["mord", "rule"], [], options.getColor());

	    // Calculate the shift, width, and height of the rule, and account for units
	    var shift = 0;
	    if (group.value.shift) {
	        shift = group.value.shift.number;
	        if (group.value.shift.unit === "ex") {
	            shift *= fontMetrics.metrics.xHeight;
	        }
	    }

	    var width = group.value.width.number;
	    if (group.value.width.unit === "ex") {
	        width *= fontMetrics.metrics.xHeight;
	    }

	    var height = group.value.height.number;
	    if (group.value.height.unit === "ex") {
	        height *= fontMetrics.metrics.xHeight;
	    }

	    // The sizes of rules are absolute, so make it larger if we are in a
	    // smaller style.
	    shift /= options.style.sizeMultiplier;
	    width /= options.style.sizeMultiplier;
	    height /= options.style.sizeMultiplier;

	    // Style the rule to the right size
	    rule.style.borderRightWidth = width + "em";
	    rule.style.borderTopWidth = height + "em";
	    rule.style.bottom = shift + "em";

	    // Record the height and width
	    rule.width = width;
	    rule.height = height + shift;
	    rule.depth = -shift;

	    return rule;
	};

	groupTypes.accent = function(group, options, prev) {
	    // Accents are handled in the TeXbook pg. 443, rule 12.
	    var base = group.value.base;

	    var supsubGroup;
	    if (group.type === "supsub") {
	        // If our base is a character box, and we have superscripts and
	        // subscripts, the supsub will defer to us. In particular, we want
	        // to attach the superscripts and subscripts to the inner body (so
	        // that the position of the superscripts and subscripts won't be
	        // affected by the height of the accent). We accomplish this by
	        // sticking the base of the accent into the base of the supsub, and
	        // rendering that, while keeping track of where the accent is.

	        // The supsub group is the group that was passed in
	        var supsub = group;
	        // The real accent group is the base of the supsub group
	        group = supsub.value.base;
	        // The character box is the base of the accent group
	        base = group.value.base;
	        // Stick the character box into the base of the supsub group
	        supsub.value.base = base;

	        // Rerender the supsub group with its new base, and store that
	        // result.
	        supsubGroup = buildGroup(
	            supsub, options.reset(), prev);
	    }

	    // Build the base group
	    var body = buildGroup(
	        base, options.withStyle(options.style.cramp()));

	    // Calculate the skew of the accent. This is based on the line "If the
	    // nucleus is not a single character, let s = 0; otherwise set s to the
	    // kern amount for the nucleus followed by the \skewchar of its font."
	    // Note that our skew metrics are just the kern between each character
	    // and the skewchar.
	    var skew;
	    if (isCharacterBox(base)) {
	        // If the base is a character box, then we want the skew of the
	        // innermost character. To do that, we find the innermost character:
	        var baseChar = getBaseElem(base);
	        // Then, we render its group to get the symbol inside it
	        var baseGroup = buildGroup(
	            baseChar, options.withStyle(options.style.cramp()));
	        // Finally, we pull the skew off of the symbol.
	        skew = baseGroup.skew;
	        // Note that we now throw away baseGroup, because the layers we
	        // removed with getBaseElem might contain things like \color which
	        // we can't get rid of.
	        // TODO(emily): Find a better way to get the skew
	    } else {
	        skew = 0;
	    }

	    // calculate the amount of space between the body and the accent
	    var clearance = Math.min(body.height, fontMetrics.metrics.xHeight);

	    // Build the accent
	    var accent = buildCommon.makeSymbol(
	        group.value.accent, "Main-Regular", "math", options.getColor());
	    // Remove the italic correction of the accent, because it only serves to
	    // shift the accent over to a place we don't want.
	    accent.italic = 0;

	    // The \vec character that the fonts use is a combining character, and
	    // thus shows up much too far to the left. To account for this, we add a
	    // specific class which shifts the accent over to where we want it.
	    // TODO(emily): Fix this in a better way, like by changing the font
	    var vecClass = group.value.accent === "\\vec" ? "accent-vec" : null;

	    var accentBody = makeSpan(["accent-body", vecClass], [
	        makeSpan([], [accent])]);

	    accentBody = buildCommon.makeVList([
	        {type: "elem", elem: body},
	        {type: "kern", size: -clearance},
	        {type: "elem", elem: accentBody},
	    ], "firstBaseline", null, options);

	    // Shift the accent over by the skew. Note we shift by twice the skew
	    // because we are centering the accent, so by adding 2*skew to the left,
	    // we shift it to the right by 1*skew.
	    accentBody.children[1].style.marginLeft = 2 * skew + "em";

	    var accentWrap = makeSpan(["mord", "accent"], [accentBody]);

	    if (supsubGroup) {
	        // Here, we replace the "base" child of the supsub with our newly
	        // generated accent.
	        supsubGroup.children[0] = accentWrap;

	        // Since we don't rerun the height calculation after replacing the
	        // accent, we manually recalculate height.
	        supsubGroup.height = Math.max(accentWrap.height, supsubGroup.height);

	        // Accents should always be ords, even when their innards are not.
	        supsubGroup.classes[0] = "mord";

	        return supsubGroup;
	    } else {
	        return accentWrap;
	    }
	};

	groupTypes.phantom = function(group, options, prev) {
	    var elements = buildExpression(
	        group.value.value,
	        options.withPhantom(),
	        prev
	    );

	    // \phantom isn't supposed to affect the elements it contains.
	    // See "color" for more details.
	    return new buildCommon.makeFragment(elements);
	};

	/**
	 * buildGroup is the function that takes a group and calls the correct groupType
	 * function for it. It also handles the interaction of size and style changes
	 * between parents and children.
	 */
	var buildGroup = function(group, options, prev) {
	    if (!group) {
	        return makeSpan();
	    }

	    if (groupTypes[group.type]) {
	        // Call the groupTypes function
	        var groupNode = groupTypes[group.type](group, options, prev);
	        var multiplier;

	        // If the style changed between the parent and the current group,
	        // account for the size difference
	        if (options.style !== options.parentStyle) {
	            multiplier = options.style.sizeMultiplier /
	                    options.parentStyle.sizeMultiplier;

	            groupNode.height *= multiplier;
	            groupNode.depth *= multiplier;
	        }

	        // If the size changed between the parent and the current group, account
	        // for that size difference.
	        if (options.size !== options.parentSize) {
	            multiplier = buildCommon.sizingMultiplier[options.size] /
	                    buildCommon.sizingMultiplier[options.parentSize];

	            groupNode.height *= multiplier;
	            groupNode.depth *= multiplier;
	        }

	        return groupNode;
	    } else {
	        throw new ParseError(
	            "Got group of unknown type: '" + group.type + "'");
	    }
	};

	/**
	 * Take an entire parse tree, and build it into an appropriate set of HTML
	 * nodes.
	 */
	var buildHTML = function(tree, options) {
	    // buildExpression is destructive, so we need to make a clone
	    // of the incoming tree so that it isn't accidentally changed
	    tree = JSON.parse(JSON.stringify(tree));

	    // Build the expression contained in the tree
	    var expression = buildExpression(tree, options);
	    var body = makeSpan(["base", options.style.cls()], expression);

	    // Add struts, which ensure that the top of the HTML element falls at the
	    // height of the expression, and the bottom of the HTML element falls at the
	    // depth of the expression.
	    var topStrut = makeSpan(["strut"]);
	    var bottomStrut = makeSpan(["strut", "bottom"]);

	    topStrut.style.height = body.height + "em";
	    bottomStrut.style.height = (body.height + body.depth) + "em";
	    // We'd like to use `vertical-align: top` but in IE 9 this lowers the
	    // baseline of the box to the bottom of this strut (instead staying in the
	    // normal place) so we use an absolute value for vertical-align instead
	    bottomStrut.style.verticalAlign = -body.depth + "em";

	    // Wrap the struts and body together
	    var htmlNode = makeSpan(["katex-html"], [topStrut, bottomStrut, body]);

	    htmlNode.setAttribute("aria-hidden", "true");

	    return htmlNode;
	};

	module.exports = buildHTML;


/***/ },
/* 76 */
/***/ function(module, exports) {

	/**
	 * This file contains information and classes for the various kinds of styles
	 * used in TeX. It provides a generic `Style` class, which holds information
	 * about a specific style. It then provides instances of all the different kinds
	 * of styles possible, and provides functions to move between them and get
	 * information about them.
	 */

	/**
	 * The main style class. Contains a unique id for the style, a size (which is
	 * the same for cramped and uncramped version of a style), a cramped flag, and a
	 * size multiplier, which gives the size difference between a style and
	 * textstyle.
	 */
	function Style(id, size, multiplier, cramped) {
	    this.id = id;
	    this.size = size;
	    this.cramped = cramped;
	    this.sizeMultiplier = multiplier;
	}

	/**
	 * Get the style of a superscript given a base in the current style.
	 */
	Style.prototype.sup = function() {
	    return styles[sup[this.id]];
	};

	/**
	 * Get the style of a subscript given a base in the current style.
	 */
	Style.prototype.sub = function() {
	    return styles[sub[this.id]];
	};

	/**
	 * Get the style of a fraction numerator given the fraction in the current
	 * style.
	 */
	Style.prototype.fracNum = function() {
	    return styles[fracNum[this.id]];
	};

	/**
	 * Get the style of a fraction denominator given the fraction in the current
	 * style.
	 */
	Style.prototype.fracDen = function() {
	    return styles[fracDen[this.id]];
	};

	/**
	 * Get the cramped version of a style (in particular, cramping a cramped style
	 * doesn't change the style).
	 */
	Style.prototype.cramp = function() {
	    return styles[cramp[this.id]];
	};

	/**
	 * HTML class name, like "displaystyle cramped"
	 */
	Style.prototype.cls = function() {
	    return sizeNames[this.size] + (this.cramped ? " cramped" : " uncramped");
	};

	/**
	 * HTML Reset class name, like "reset-textstyle"
	 */
	Style.prototype.reset = function() {
	    return resetNames[this.size];
	};

	// IDs of the different styles
	var D = 0;
	var Dc = 1;
	var T = 2;
	var Tc = 3;
	var S = 4;
	var Sc = 5;
	var SS = 6;
	var SSc = 7;

	// String names for the different sizes
	var sizeNames = [
	    "displaystyle textstyle",
	    "textstyle",
	    "scriptstyle",
	    "scriptscriptstyle",
	];

	// Reset names for the different sizes
	var resetNames = [
	    "reset-textstyle",
	    "reset-textstyle",
	    "reset-scriptstyle",
	    "reset-scriptscriptstyle",
	];

	// Instances of the different styles
	var styles = [
	    new Style(D, 0, 1.0, false),
	    new Style(Dc, 0, 1.0, true),
	    new Style(T, 1, 1.0, false),
	    new Style(Tc, 1, 1.0, true),
	    new Style(S, 2, 0.7, false),
	    new Style(Sc, 2, 0.7, true),
	    new Style(SS, 3, 0.5, false),
	    new Style(SSc, 3, 0.5, true),
	];

	// Lookup tables for switching from one style to another
	var sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
	var sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
	var fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
	var fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
	var cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];

	// We only export some of the styles. Also, we don't export the `Style` class so
	// no more styles can be generated.
	module.exports = {
	    DISPLAY: styles[D],
	    TEXT: styles[T],
	    SCRIPT: styles[S],
	    SCRIPTSCRIPT: styles[SS],
	};


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-console:0 */
	/**
	 * This module contains general functions that can be used for building
	 * different kinds of domTree nodes in a consistent manner.
	 */

	var domTree = __webpack_require__(78);
	var fontMetrics = __webpack_require__(80);
	var symbols = __webpack_require__(82);
	var utils = __webpack_require__(79);

	var greekCapitals = [
	    "\\Gamma",
	    "\\Delta",
	    "\\Theta",
	    "\\Lambda",
	    "\\Xi",
	    "\\Pi",
	    "\\Sigma",
	    "\\Upsilon",
	    "\\Phi",
	    "\\Psi",
	    "\\Omega",
	];

	var dotlessLetters = [
	    "\u0131",   // dotless i, \imath
	    "\u0237",   // dotless j, \jmath
	];

	/**
	 * Makes a symbolNode after translation via the list of symbols in symbols.js.
	 * Correctly pulls out metrics for the character, and optionally takes a list of
	 * classes to be attached to the node.
	 */
	var makeSymbol = function(value, style, mode, color, classes) {
	    // Replace the value with its replaced value from symbol.js
	    if (symbols[mode][value] && symbols[mode][value].replace) {
	        value = symbols[mode][value].replace;
	    }

	    var metrics = fontMetrics.getCharacterMetrics(value, style);

	    var symbolNode;
	    if (metrics) {
	        symbolNode = new domTree.symbolNode(
	            value, metrics.height, metrics.depth, metrics.italic, metrics.skew,
	            classes);
	    } else {
	        // TODO(emily): Figure out a good way to only print this in development
	        typeof console !== "undefined" && console.warn(
	            "No character metrics for '" + value + "' in style '" +
	                style + "'");
	        symbolNode = new domTree.symbolNode(value, 0, 0, 0, 0, classes);
	    }

	    if (color) {
	        symbolNode.style.color = color;
	    }

	    return symbolNode;
	};

	/**
	 * Makes a symbol in Main-Regular or AMS-Regular.
	 * Used for rel, bin, open, close, inner, and punct.
	 */
	var mathsym = function(value, mode, color, classes) {
	    // Decide what font to render the symbol in by its entry in the symbols
	    // table.
	    // Have a special case for when the value = \ because the \ is used as a
	    // textord in unsupported command errors but cannot be parsed as a regular
	    // text ordinal and is therefore not present as a symbol in the symbols
	    // table for text
	    if (value === "\\" || symbols[mode][value].font === "main") {
	        return makeSymbol(value, "Main-Regular", mode, color, classes);
	    } else {
	        return makeSymbol(
	            value, "AMS-Regular", mode, color, classes.concat(["amsrm"]));
	    }
	};

	/**
	 * Makes a symbol in the default font for mathords and textords.
	 */
	var mathDefault = function(value, mode, color, classes, type) {
	    if (type === "mathord") {
	        return mathit(value, mode, color, classes);
	    } else if (type === "textord") {
	        return makeSymbol(
	            value, "Main-Regular", mode, color, classes.concat(["mathrm"]));
	    } else {
	        throw new Error("unexpected type: " + type + " in mathDefault");
	    }
	};

	/**
	 * Makes a symbol in the italic math font.
	 */
	var mathit = function(value, mode, color, classes) {
	    if (/[0-9]/.test(value.charAt(0)) ||
	            // glyphs for \imath and \jmath do not exist in Math-Italic so we
	            // need to use Main-Italic instead
	            utils.contains(dotlessLetters, value) ||
	            utils.contains(greekCapitals, value)) {
	        return makeSymbol(
	            value, "Main-Italic", mode, color, classes.concat(["mainit"]));
	    } else {
	        return makeSymbol(
	            value, "Math-Italic", mode, color, classes.concat(["mathit"]));
	    }
	};

	/**
	 * Makes either a mathord or textord in the correct font and color.
	 */
	var makeOrd = function(group, options, type) {
	    var mode = group.mode;
	    var value = group.value;
	    if (symbols[mode][value] && symbols[mode][value].replace) {
	        value = symbols[mode][value].replace;
	    }

	    var classes = ["mord"];
	    var color = options.getColor();

	    var font = options.font;
	    if (font) {
	        if (font === "mathit" || utils.contains(dotlessLetters, value)) {
	            return mathit(value, mode, color, classes);
	        } else {
	            var fontName = fontMap[font].fontName;
	            if (fontMetrics.getCharacterMetrics(value, fontName)) {
	                return makeSymbol(
	                    value, fontName, mode, color, classes.concat([font]));
	            } else {
	                return mathDefault(value, mode, color, classes, type);
	            }
	        }
	    } else {
	        return mathDefault(value, mode, color, classes, type);
	    }
	};

	/**
	 * Calculate the height, depth, and maxFontSize of an element based on its
	 * children.
	 */
	var sizeElementFromChildren = function(elem) {
	    var height = 0;
	    var depth = 0;
	    var maxFontSize = 0;

	    if (elem.children) {
	        for (var i = 0; i < elem.children.length; i++) {
	            if (elem.children[i].height > height) {
	                height = elem.children[i].height;
	            }
	            if (elem.children[i].depth > depth) {
	                depth = elem.children[i].depth;
	            }
	            if (elem.children[i].maxFontSize > maxFontSize) {
	                maxFontSize = elem.children[i].maxFontSize;
	            }
	        }
	    }

	    elem.height = height;
	    elem.depth = depth;
	    elem.maxFontSize = maxFontSize;
	};

	/**
	 * Makes a span with the given list of classes, list of children, and color.
	 */
	var makeSpan = function(classes, children, color) {
	    var span = new domTree.span(classes, children);

	    sizeElementFromChildren(span);

	    if (color) {
	        span.style.color = color;
	    }

	    return span;
	};

	/**
	 * Makes a document fragment with the given list of children.
	 */
	var makeFragment = function(children) {
	    var fragment = new domTree.documentFragment(children);

	    sizeElementFromChildren(fragment);

	    return fragment;
	};

	/**
	 * Makes an element placed in each of the vlist elements to ensure that each
	 * element has the same max font size. To do this, we create a zero-width space
	 * with the correct font size.
	 */
	var makeFontSizer = function(options, fontSize) {
	    var fontSizeInner = makeSpan([], [new domTree.symbolNode("\u200b")]);
	    fontSizeInner.style.fontSize =
	        (fontSize / options.style.sizeMultiplier) + "em";

	    var fontSizer = makeSpan(
	        ["fontsize-ensurer", "reset-" + options.size, "size5"],
	        [fontSizeInner]);

	    return fontSizer;
	};

	/**
	 * Makes a vertical list by stacking elements and kerns on top of each other.
	 * Allows for many different ways of specifying the positioning method.
	 *
	 * Arguments:
	 *  - children: A list of child or kern nodes to be stacked on top of each other
	 *              (i.e. the first element will be at the bottom, and the last at
	 *              the top). Element nodes are specified as
	 *                {type: "elem", elem: node}
	 *              while kern nodes are specified as
	 *                {type: "kern", size: size}
	 *  - positionType: The method by which the vlist should be positioned. Valid
	 *                  values are:
	 *                   - "individualShift": The children list only contains elem
	 *                                        nodes, and each node contains an extra
	 *                                        "shift" value of how much it should be
	 *                                        shifted (note that shifting is always
	 *                                        moving downwards). positionData is
	 *                                        ignored.
	 *                   - "top": The positionData specifies the topmost point of
	 *                            the vlist (note this is expected to be a height,
	 *                            so positive values move up)
	 *                   - "bottom": The positionData specifies the bottommost point
	 *                               of the vlist (note this is expected to be a
	 *                               depth, so positive values move down
	 *                   - "shift": The vlist will be positioned such that its
	 *                              baseline is positionData away from the baseline
	 *                              of the first child. Positive values move
	 *                              downwards.
	 *                   - "firstBaseline": The vlist will be positioned such that
	 *                                      its baseline is aligned with the
	 *                                      baseline of the first child.
	 *                                      positionData is ignored. (this is
	 *                                      equivalent to "shift" with
	 *                                      positionData=0)
	 *  - positionData: Data used in different ways depending on positionType
	 *  - options: An Options object
	 *
	 */
	var makeVList = function(children, positionType, positionData, options) {
	    var depth;
	    var currPos;
	    var i;
	    if (positionType === "individualShift") {
	        var oldChildren = children;
	        children = [oldChildren[0]];

	        // Add in kerns to the list of children to get each element to be
	        // shifted to the correct specified shift
	        depth = -oldChildren[0].shift - oldChildren[0].elem.depth;
	        currPos = depth;
	        for (i = 1; i < oldChildren.length; i++) {
	            var diff = -oldChildren[i].shift - currPos -
	                oldChildren[i].elem.depth;
	            var size = diff -
	                (oldChildren[i - 1].elem.height +
	                 oldChildren[i - 1].elem.depth);

	            currPos = currPos + diff;

	            children.push({type: "kern", size: size});
	            children.push(oldChildren[i]);
	        }
	    } else if (positionType === "top") {
	        // We always start at the bottom, so calculate the bottom by adding up
	        // all the sizes
	        var bottom = positionData;
	        for (i = 0; i < children.length; i++) {
	            if (children[i].type === "kern") {
	                bottom -= children[i].size;
	            } else {
	                bottom -= children[i].elem.height + children[i].elem.depth;
	            }
	        }
	        depth = bottom;
	    } else if (positionType === "bottom") {
	        depth = -positionData;
	    } else if (positionType === "shift") {
	        depth = -children[0].elem.depth - positionData;
	    } else if (positionType === "firstBaseline") {
	        depth = -children[0].elem.depth;
	    } else {
	        depth = 0;
	    }

	    // Make the fontSizer
	    var maxFontSize = 0;
	    for (i = 0; i < children.length; i++) {
	        if (children[i].type === "elem") {
	            maxFontSize = Math.max(maxFontSize, children[i].elem.maxFontSize);
	        }
	    }
	    var fontSizer = makeFontSizer(options, maxFontSize);

	    // Create a new list of actual children at the correct offsets
	    var realChildren = [];
	    currPos = depth;
	    for (i = 0; i < children.length; i++) {
	        if (children[i].type === "kern") {
	            currPos += children[i].size;
	        } else {
	            var child = children[i].elem;

	            var shift = -child.depth - currPos;
	            currPos += child.height + child.depth;

	            var childWrap = makeSpan([], [fontSizer, child]);
	            childWrap.height -= shift;
	            childWrap.depth += shift;
	            childWrap.style.top = shift + "em";

	            realChildren.push(childWrap);
	        }
	    }

	    // Add in an element at the end with no offset to fix the calculation of
	    // baselines in some browsers (namely IE, sometimes safari)
	    var baselineFix = makeSpan(
	        ["baseline-fix"], [fontSizer, new domTree.symbolNode("\u200b")]);
	    realChildren.push(baselineFix);

	    var vlist = makeSpan(["vlist"], realChildren);
	    // Fix the final height and depth, in case there were kerns at the ends
	    // since the makeSpan calculation won't take that in to account.
	    vlist.height = Math.max(currPos, vlist.height);
	    vlist.depth = Math.max(-depth, vlist.depth);
	    return vlist;
	};

	// A table of size -> font size for the different sizing functions
	var sizingMultiplier = {
	    size1: 0.5,
	    size2: 0.7,
	    size3: 0.8,
	    size4: 0.9,
	    size5: 1.0,
	    size6: 1.2,
	    size7: 1.44,
	    size8: 1.73,
	    size9: 2.07,
	    size10: 2.49,
	};

	// A map of spacing functions to their attributes, like size and corresponding
	// CSS class
	var spacingFunctions = {
	    "\\qquad": {
	        size: "2em",
	        className: "qquad",
	    },
	    "\\quad": {
	        size: "1em",
	        className: "quad",
	    },
	    "\\enspace": {
	        size: "0.5em",
	        className: "enspace",
	    },
	    "\\;": {
	        size: "0.277778em",
	        className: "thickspace",
	    },
	    "\\:": {
	        size: "0.22222em",
	        className: "mediumspace",
	    },
	    "\\,": {
	        size: "0.16667em",
	        className: "thinspace",
	    },
	    "\\!": {
	        size: "-0.16667em",
	        className: "negativethinspace",
	    },
	};

	/**
	 * Maps TeX font commands to objects containing:
	 * - variant: string used for "mathvariant" attribute in buildMathML.js
	 * - fontName: the "style" parameter to fontMetrics.getCharacterMetrics
	 */
	// A map between tex font commands an MathML mathvariant attribute values
	var fontMap = {
	    // styles
	    "mathbf": {
	        variant: "bold",
	        fontName: "Main-Bold",
	    },
	    "mathrm": {
	        variant: "normal",
	        fontName: "Main-Regular",
	    },

	    // "mathit" is missing because it requires the use of two fonts: Main-Italic
	    // and Math-Italic.  This is handled by a special case in makeOrd which ends
	    // up calling mathit.

	    // families
	    "mathbb": {
	        variant: "double-struck",
	        fontName: "AMS-Regular",
	    },
	    "mathcal": {
	        variant: "script",
	        fontName: "Caligraphic-Regular",
	    },
	    "mathfrak": {
	        variant: "fraktur",
	        fontName: "Fraktur-Regular",
	    },
	    "mathscr": {
	        variant: "script",
	        fontName: "Script-Regular",
	    },
	    "mathsf": {
	        variant: "sans-serif",
	        fontName: "SansSerif-Regular",
	    },
	    "mathtt": {
	        variant: "monospace",
	        fontName: "Typewriter-Regular",
	    },
	};

	module.exports = {
	    fontMap: fontMap,
	    makeSymbol: makeSymbol,
	    mathsym: mathsym,
	    makeSpan: makeSpan,
	    makeFragment: makeFragment,
	    makeVList: makeVList,
	    makeOrd: makeOrd,
	    sizingMultiplier: sizingMultiplier,
	    spacingFunctions: spacingFunctions,
	};


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * These objects store the data about the DOM nodes we create, as well as some
	 * extra data. They can then be transformed into real DOM nodes with the
	 * `toNode` function or HTML markup using `toMarkup`. They are useful for both
	 * storing extra properties on the nodes, as well as providing a way to easily
	 * work with the DOM.
	 *
	 * Similar functions for working with MathML nodes exist in mathMLTree.js.
	 */

	var utils = __webpack_require__(79);

	/**
	 * Create an HTML className based on a list of classes. In addition to joining
	 * with spaces, we also remove null or empty classes.
	 */
	var createClass = function(classes) {
	    classes = classes.slice();
	    for (var i = classes.length - 1; i >= 0; i--) {
	        if (!classes[i]) {
	            classes.splice(i, 1);
	        }
	    }

	    return classes.join(" ");
	};

	/**
	 * This node represents a span node, with a className, a list of children, and
	 * an inline style. It also contains information about its height, depth, and
	 * maxFontSize.
	 */
	function span(classes, children, height, depth, maxFontSize, style) {
	    this.classes = classes || [];
	    this.children = children || [];
	    this.height = height || 0;
	    this.depth = depth || 0;
	    this.maxFontSize = maxFontSize || 0;
	    this.style = style || {};
	    this.attributes = {};
	}

	/**
	 * Sets an arbitrary attribute on the span. Warning: use this wisely. Not all
	 * browsers support attributes the same, and having too many custom attributes
	 * is probably bad.
	 */
	span.prototype.setAttribute = function(attribute, value) {
	    this.attributes[attribute] = value;
	};

	/**
	 * Convert the span into an HTML node
	 */
	span.prototype.toNode = function() {
	    var span = document.createElement("span");

	    // Apply the class
	    span.className = createClass(this.classes);

	    // Apply inline styles
	    for (var style in this.style) {
	        if (Object.prototype.hasOwnProperty.call(this.style, style)) {
	            span.style[style] = this.style[style];
	        }
	    }

	    // Apply attributes
	    for (var attr in this.attributes) {
	        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
	            span.setAttribute(attr, this.attributes[attr]);
	        }
	    }

	    // Append the children, also as HTML nodes
	    for (var i = 0; i < this.children.length; i++) {
	        span.appendChild(this.children[i].toNode());
	    }

	    return span;
	};

	/**
	 * Convert the span into an HTML markup string
	 */
	span.prototype.toMarkup = function() {
	    var markup = "<span";

	    // Add the class
	    if (this.classes.length) {
	        markup += " class=\"";
	        markup += utils.escape(createClass(this.classes));
	        markup += "\"";
	    }

	    var styles = "";

	    // Add the styles, after hyphenation
	    for (var style in this.style) {
	        if (this.style.hasOwnProperty(style)) {
	            styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
	        }
	    }

	    if (styles) {
	        markup += " style=\"" + utils.escape(styles) + "\"";
	    }

	    // Add the attributes
	    for (var attr in this.attributes) {
	        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
	            markup += " " + attr + "=\"";
	            markup += utils.escape(this.attributes[attr]);
	            markup += "\"";
	        }
	    }

	    markup += ">";

	    // Add the markup of the children, also as markup
	    for (var i = 0; i < this.children.length; i++) {
	        markup += this.children[i].toMarkup();
	    }

	    markup += "</span>";

	    return markup;
	};

	/**
	 * This node represents a document fragment, which contains elements, but when
	 * placed into the DOM doesn't have any representation itself. Thus, it only
	 * contains children and doesn't have any HTML properties. It also keeps track
	 * of a height, depth, and maxFontSize.
	 */
	function documentFragment(children, height, depth, maxFontSize) {
	    this.children = children || [];
	    this.height = height || 0;
	    this.depth = depth || 0;
	    this.maxFontSize = maxFontSize || 0;
	}

	/**
	 * Convert the fragment into a node
	 */
	documentFragment.prototype.toNode = function() {
	    // Create a fragment
	    var frag = document.createDocumentFragment();

	    // Append the children
	    for (var i = 0; i < this.children.length; i++) {
	        frag.appendChild(this.children[i].toNode());
	    }

	    return frag;
	};

	/**
	 * Convert the fragment into HTML markup
	 */
	documentFragment.prototype.toMarkup = function() {
	    var markup = "";

	    // Simply concatenate the markup for the children together
	    for (var i = 0; i < this.children.length; i++) {
	        markup += this.children[i].toMarkup();
	    }

	    return markup;
	};

	/**
	 * A symbol node contains information about a single symbol. It either renders
	 * to a single text node, or a span with a single text node in it, depending on
	 * whether it has CSS classes, styles, or needs italic correction.
	 */
	function symbolNode(value, height, depth, italic, skew, classes, style) {
	    this.value = value || "";
	    this.height = height || 0;
	    this.depth = depth || 0;
	    this.italic = italic || 0;
	    this.skew = skew || 0;
	    this.classes = classes || [];
	    this.style = style || {};
	    this.maxFontSize = 0;
	}

	/**
	 * Creates a text node or span from a symbol node. Note that a span is only
	 * created if it is needed.
	 */
	symbolNode.prototype.toNode = function() {
	    var node = document.createTextNode(this.value);
	    var span = null;

	    if (this.italic > 0) {
	        span = document.createElement("span");
	        span.style.marginRight = this.italic + "em";
	    }

	    if (this.classes.length > 0) {
	        span = span || document.createElement("span");
	        span.className = createClass(this.classes);
	    }

	    for (var style in this.style) {
	        if (this.style.hasOwnProperty(style)) {
	            span = span || document.createElement("span");
	            span.style[style] = this.style[style];
	        }
	    }

	    if (span) {
	        span.appendChild(node);
	        return span;
	    } else {
	        return node;
	    }
	};

	/**
	 * Creates markup for a symbol node.
	 */
	symbolNode.prototype.toMarkup = function() {
	    // TODO(alpert): More duplication than I'd like from
	    // span.prototype.toMarkup and symbolNode.prototype.toNode...
	    var needsSpan = false;

	    var markup = "<span";

	    if (this.classes.length) {
	        needsSpan = true;
	        markup += " class=\"";
	        markup += utils.escape(createClass(this.classes));
	        markup += "\"";
	    }

	    var styles = "";

	    if (this.italic > 0) {
	        styles += "margin-right:" + this.italic + "em;";
	    }
	    for (var style in this.style) {
	        if (this.style.hasOwnProperty(style)) {
	            styles += utils.hyphenate(style) + ":" + this.style[style] + ";";
	        }
	    }

	    if (styles) {
	        needsSpan = true;
	        markup += " style=\"" + utils.escape(styles) + "\"";
	    }

	    var escaped = utils.escape(this.value);
	    if (needsSpan) {
	        markup += ">";
	        markup += escaped;
	        markup += "</span>";
	        return markup;
	    } else {
	        return escaped;
	    }
	};

	module.exports = {
	    span: span,
	    documentFragment: documentFragment,
	    symbolNode: symbolNode,
	};


/***/ },
/* 79 */
/***/ function(module, exports) {

	/**
	 * This file contains a list of utility functions which are useful in other
	 * files.
	 */

	/**
	 * Provide an `indexOf` function which works in IE8, but defers to native if
	 * possible.
	 */
	var nativeIndexOf = Array.prototype.indexOf;
	var indexOf = function(list, elem) {
	    if (list == null) {
	        return -1;
	    }
	    if (nativeIndexOf && list.indexOf === nativeIndexOf) {
	        return list.indexOf(elem);
	    }
	    var i = 0;
	    var l = list.length;
	    for (; i < l; i++) {
	        if (list[i] === elem) {
	            return i;
	        }
	    }
	    return -1;
	};

	/**
	 * Return whether an element is contained in a list
	 */
	var contains = function(list, elem) {
	    return indexOf(list, elem) !== -1;
	};

	/**
	 * Provide a default value if a setting is undefined
	 */
	var deflt = function(setting, defaultIfUndefined) {
	    return setting === undefined ? defaultIfUndefined : setting;
	};

	// hyphenate and escape adapted from Facebook's React under Apache 2 license

	var uppercase = /([A-Z])/g;
	var hyphenate = function(str) {
	    return str.replace(uppercase, "-$1").toLowerCase();
	};

	var ESCAPE_LOOKUP = {
	    "&": "&amp;",
	    ">": "&gt;",
	    "<": "&lt;",
	    "\"": "&quot;",
	    "'": "&#x27;",
	};

	var ESCAPE_REGEX = /[&><"']/g;

	function escaper(match) {
	    return ESCAPE_LOOKUP[match];
	}

	/**
	 * Escapes text to prevent scripting attacks.
	 *
	 * @param {*} text Text value to escape.
	 * @return {string} An escaped string.
	 */
	function escape(text) {
	    return ("" + text).replace(ESCAPE_REGEX, escaper);
	}

	/**
	 * A function to set the text content of a DOM element in all supported
	 * browsers. Note that we don't define this if there is no document.
	 */
	var setTextContent;
	if (typeof document !== "undefined") {
	    var testNode = document.createElement("span");
	    if ("textContent" in testNode) {
	        setTextContent = function(node, text) {
	            node.textContent = text;
	        };
	    } else {
	        setTextContent = function(node, text) {
	            node.innerText = text;
	        };
	    }
	}

	/**
	 * A function to clear a node.
	 */
	function clearNode(node) {
	    setTextContent(node, "");
	}

	module.exports = {
	    contains: contains,
	    deflt: deflt,
	    escape: escape,
	    hyphenate: hyphenate,
	    indexOf: indexOf,
	    setTextContent: setTextContent,
	    clearNode: clearNode,
	};


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-unused-vars:0 */

	var Style = __webpack_require__(76);

	/**
	 * This file contains metrics regarding fonts and individual symbols. The sigma
	 * and xi variables, as well as the metricMap map contain data extracted from
	 * TeX, TeX font metrics, and the TTF files. These data are then exposed via the
	 * `metrics` variable and the getCharacterMetrics function.
	 */

	// These font metrics are extracted from TeX by using
	// \font\a=cmmi10
	// \showthe\fontdimenX\a
	// where X is the corresponding variable number. These correspond to the font
	// parameters of the symbol fonts. In TeX, there are actually three sets of
	// dimensions, one for each of textstyle, scriptstyle, and scriptscriptstyle,
	// but we only use the textstyle ones, and scale certain dimensions accordingly.
	// See the TeXbook, page 441.
	var sigma1 = 0.025;
	var sigma2 = 0;
	var sigma3 = 0;
	var sigma4 = 0;
	var sigma5 = 0.431;
	var sigma6 = 1;
	var sigma7 = 0;
	var sigma8 = 0.677;
	var sigma9 = 0.394;
	var sigma10 = 0.444;
	var sigma11 = 0.686;
	var sigma12 = 0.345;
	var sigma13 = 0.413;
	var sigma14 = 0.363;
	var sigma15 = 0.289;
	var sigma16 = 0.150;
	var sigma17 = 0.247;
	var sigma18 = 0.386;
	var sigma19 = 0.050;
	var sigma20 = 2.390;
	var sigma21 = 1.01;
	var sigma21Script = 0.81;
	var sigma21ScriptScript = 0.71;
	var sigma22 = 0.250;

	// These font metrics are extracted from TeX by using
	// \font\a=cmex10
	// \showthe\fontdimenX\a
	// where X is the corresponding variable number. These correspond to the font
	// parameters of the extension fonts (family 3). See the TeXbook, page 441.
	var xi1 = 0;
	var xi2 = 0;
	var xi3 = 0;
	var xi4 = 0;
	var xi5 = 0.431;
	var xi6 = 1;
	var xi7 = 0;
	var xi8 = 0.04;
	var xi9 = 0.111;
	var xi10 = 0.166;
	var xi11 = 0.2;
	var xi12 = 0.6;
	var xi13 = 0.1;

	// This value determines how large a pt is, for metrics which are defined in
	// terms of pts.
	// This value is also used in katex.less; if you change it make sure the values
	// match.
	var ptPerEm = 10.0;

	// The space between adjacent `|` columns in an array definition. From
	// `\showthe\doublerulesep` in LaTeX.
	var doubleRuleSep = 2.0 / ptPerEm;

	/**
	 * This is just a mapping from common names to real metrics
	 */
	var metrics = {
	    xHeight: sigma5,
	    quad: sigma6,
	    num1: sigma8,
	    num2: sigma9,
	    num3: sigma10,
	    denom1: sigma11,
	    denom2: sigma12,
	    sup1: sigma13,
	    sup2: sigma14,
	    sup3: sigma15,
	    sub1: sigma16,
	    sub2: sigma17,
	    supDrop: sigma18,
	    subDrop: sigma19,
	    axisHeight: sigma22,
	    defaultRuleThickness: xi8,
	    bigOpSpacing1: xi9,
	    bigOpSpacing2: xi10,
	    bigOpSpacing3: xi11,
	    bigOpSpacing4: xi12,
	    bigOpSpacing5: xi13,
	    ptPerEm: ptPerEm,
	    emPerEx: sigma5 / sigma6,
	    doubleRuleSep: doubleRuleSep,

	    // TODO(alpert): Missing parallel structure here. We should probably add
	    // style-specific metrics for all of these.
	    delim1: sigma20,
	    getDelim2: function(style) {
	        if (style.size === Style.TEXT.size) {
	            return sigma21;
	        } else if (style.size === Style.SCRIPT.size) {
	            return sigma21Script;
	        } else if (style.size === Style.SCRIPTSCRIPT.size) {
	            return sigma21ScriptScript;
	        }
	        throw new Error("Unexpected style size: " + style.size);
	    },
	};

	// This map contains a mapping from font name and character code to character
	// metrics, including height, depth, italic correction, and skew (kern from the
	// character to the corresponding \skewchar)
	// This map is generated via `make metrics`. It should not be changed manually.
	var metricMap = __webpack_require__(81);

	/**
	 * This function is a convenience function for looking up information in the
	 * metricMap table. It takes a character as a string, and a style.
	 *
	 * Note: the `width` property may be undefined if fontMetricsData.js wasn't
	 * built using `Make extended_metrics`.
	 */
	var getCharacterMetrics = function(character, style) {
	    var metrics = metricMap[style][character.charCodeAt(0)];
	    if (metrics) {
	        return {
	            depth: metrics[0],
	            height: metrics[1],
	            italic: metrics[2],
	            skew: metrics[3],
	            width: metrics[4],
	        };
	    }
	};

	module.exports = {
	    metrics: metrics,
	    getCharacterMetrics: getCharacterMetrics,
	};


/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = {
	    "AMS-Regular": {
	        "65": [0, 0.68889, 0, 0],
	        "66": [0, 0.68889, 0, 0],
	        "67": [0, 0.68889, 0, 0],
	        "68": [0, 0.68889, 0, 0],
	        "69": [0, 0.68889, 0, 0],
	        "70": [0, 0.68889, 0, 0],
	        "71": [0, 0.68889, 0, 0],
	        "72": [0, 0.68889, 0, 0],
	        "73": [0, 0.68889, 0, 0],
	        "74": [0.16667, 0.68889, 0, 0],
	        "75": [0, 0.68889, 0, 0],
	        "76": [0, 0.68889, 0, 0],
	        "77": [0, 0.68889, 0, 0],
	        "78": [0, 0.68889, 0, 0],
	        "79": [0.16667, 0.68889, 0, 0],
	        "80": [0, 0.68889, 0, 0],
	        "81": [0.16667, 0.68889, 0, 0],
	        "82": [0, 0.68889, 0, 0],
	        "83": [0, 0.68889, 0, 0],
	        "84": [0, 0.68889, 0, 0],
	        "85": [0, 0.68889, 0, 0],
	        "86": [0, 0.68889, 0, 0],
	        "87": [0, 0.68889, 0, 0],
	        "88": [0, 0.68889, 0, 0],
	        "89": [0, 0.68889, 0, 0],
	        "90": [0, 0.68889, 0, 0],
	        "107": [0, 0.68889, 0, 0],
	        "165": [0, 0.675, 0.025, 0],
	        "174": [0.15559, 0.69224, 0, 0],
	        "240": [0, 0.68889, 0, 0],
	        "295": [0, 0.68889, 0, 0],
	        "710": [0, 0.825, 0, 0],
	        "732": [0, 0.9, 0, 0],
	        "770": [0, 0.825, 0, 0],
	        "771": [0, 0.9, 0, 0],
	        "989": [0.08167, 0.58167, 0, 0],
	        "1008": [0, 0.43056, 0.04028, 0],
	        "8245": [0, 0.54986, 0, 0],
	        "8463": [0, 0.68889, 0, 0],
	        "8487": [0, 0.68889, 0, 0],
	        "8498": [0, 0.68889, 0, 0],
	        "8502": [0, 0.68889, 0, 0],
	        "8503": [0, 0.68889, 0, 0],
	        "8504": [0, 0.68889, 0, 0],
	        "8513": [0, 0.68889, 0, 0],
	        "8592": [-0.03598, 0.46402, 0, 0],
	        "8594": [-0.03598, 0.46402, 0, 0],
	        "8602": [-0.13313, 0.36687, 0, 0],
	        "8603": [-0.13313, 0.36687, 0, 0],
	        "8606": [0.01354, 0.52239, 0, 0],
	        "8608": [0.01354, 0.52239, 0, 0],
	        "8610": [0.01354, 0.52239, 0, 0],
	        "8611": [0.01354, 0.52239, 0, 0],
	        "8619": [0, 0.54986, 0, 0],
	        "8620": [0, 0.54986, 0, 0],
	        "8621": [-0.13313, 0.37788, 0, 0],
	        "8622": [-0.13313, 0.36687, 0, 0],
	        "8624": [0, 0.69224, 0, 0],
	        "8625": [0, 0.69224, 0, 0],
	        "8630": [0, 0.43056, 0, 0],
	        "8631": [0, 0.43056, 0, 0],
	        "8634": [0.08198, 0.58198, 0, 0],
	        "8635": [0.08198, 0.58198, 0, 0],
	        "8638": [0.19444, 0.69224, 0, 0],
	        "8639": [0.19444, 0.69224, 0, 0],
	        "8642": [0.19444, 0.69224, 0, 0],
	        "8643": [0.19444, 0.69224, 0, 0],
	        "8644": [0.1808, 0.675, 0, 0],
	        "8646": [0.1808, 0.675, 0, 0],
	        "8647": [0.1808, 0.675, 0, 0],
	        "8648": [0.19444, 0.69224, 0, 0],
	        "8649": [0.1808, 0.675, 0, 0],
	        "8650": [0.19444, 0.69224, 0, 0],
	        "8651": [0.01354, 0.52239, 0, 0],
	        "8652": [0.01354, 0.52239, 0, 0],
	        "8653": [-0.13313, 0.36687, 0, 0],
	        "8654": [-0.13313, 0.36687, 0, 0],
	        "8655": [-0.13313, 0.36687, 0, 0],
	        "8666": [0.13667, 0.63667, 0, 0],
	        "8667": [0.13667, 0.63667, 0, 0],
	        "8669": [-0.13313, 0.37788, 0, 0],
	        "8672": [-0.064, 0.437, 0, 0],
	        "8674": [-0.064, 0.437, 0, 0],
	        "8705": [0, 0.825, 0, 0],
	        "8708": [0, 0.68889, 0, 0],
	        "8709": [0.08167, 0.58167, 0, 0],
	        "8717": [0, 0.43056, 0, 0],
	        "8722": [-0.03598, 0.46402, 0, 0],
	        "8724": [0.08198, 0.69224, 0, 0],
	        "8726": [0.08167, 0.58167, 0, 0],
	        "8733": [0, 0.69224, 0, 0],
	        "8736": [0, 0.69224, 0, 0],
	        "8737": [0, 0.69224, 0, 0],
	        "8738": [0.03517, 0.52239, 0, 0],
	        "8739": [0.08167, 0.58167, 0, 0],
	        "8740": [0.25142, 0.74111, 0, 0],
	        "8741": [0.08167, 0.58167, 0, 0],
	        "8742": [0.25142, 0.74111, 0, 0],
	        "8756": [0, 0.69224, 0, 0],
	        "8757": [0, 0.69224, 0, 0],
	        "8764": [-0.13313, 0.36687, 0, 0],
	        "8765": [-0.13313, 0.37788, 0, 0],
	        "8769": [-0.13313, 0.36687, 0, 0],
	        "8770": [-0.03625, 0.46375, 0, 0],
	        "8774": [0.30274, 0.79383, 0, 0],
	        "8776": [-0.01688, 0.48312, 0, 0],
	        "8778": [0.08167, 0.58167, 0, 0],
	        "8782": [0.06062, 0.54986, 0, 0],
	        "8783": [0.06062, 0.54986, 0, 0],
	        "8785": [0.08198, 0.58198, 0, 0],
	        "8786": [0.08198, 0.58198, 0, 0],
	        "8787": [0.08198, 0.58198, 0, 0],
	        "8790": [0, 0.69224, 0, 0],
	        "8791": [0.22958, 0.72958, 0, 0],
	        "8796": [0.08198, 0.91667, 0, 0],
	        "8806": [0.25583, 0.75583, 0, 0],
	        "8807": [0.25583, 0.75583, 0, 0],
	        "8808": [0.25142, 0.75726, 0, 0],
	        "8809": [0.25142, 0.75726, 0, 0],
	        "8812": [0.25583, 0.75583, 0, 0],
	        "8814": [0.20576, 0.70576, 0, 0],
	        "8815": [0.20576, 0.70576, 0, 0],
	        "8816": [0.30274, 0.79383, 0, 0],
	        "8817": [0.30274, 0.79383, 0, 0],
	        "8818": [0.22958, 0.72958, 0, 0],
	        "8819": [0.22958, 0.72958, 0, 0],
	        "8822": [0.1808, 0.675, 0, 0],
	        "8823": [0.1808, 0.675, 0, 0],
	        "8828": [0.13667, 0.63667, 0, 0],
	        "8829": [0.13667, 0.63667, 0, 0],
	        "8830": [0.22958, 0.72958, 0, 0],
	        "8831": [0.22958, 0.72958, 0, 0],
	        "8832": [0.20576, 0.70576, 0, 0],
	        "8833": [0.20576, 0.70576, 0, 0],
	        "8840": [0.30274, 0.79383, 0, 0],
	        "8841": [0.30274, 0.79383, 0, 0],
	        "8842": [0.13597, 0.63597, 0, 0],
	        "8843": [0.13597, 0.63597, 0, 0],
	        "8847": [0.03517, 0.54986, 0, 0],
	        "8848": [0.03517, 0.54986, 0, 0],
	        "8858": [0.08198, 0.58198, 0, 0],
	        "8859": [0.08198, 0.58198, 0, 0],
	        "8861": [0.08198, 0.58198, 0, 0],
	        "8862": [0, 0.675, 0, 0],
	        "8863": [0, 0.675, 0, 0],
	        "8864": [0, 0.675, 0, 0],
	        "8865": [0, 0.675, 0, 0],
	        "8872": [0, 0.69224, 0, 0],
	        "8873": [0, 0.69224, 0, 0],
	        "8874": [0, 0.69224, 0, 0],
	        "8876": [0, 0.68889, 0, 0],
	        "8877": [0, 0.68889, 0, 0],
	        "8878": [0, 0.68889, 0, 0],
	        "8879": [0, 0.68889, 0, 0],
	        "8882": [0.03517, 0.54986, 0, 0],
	        "8883": [0.03517, 0.54986, 0, 0],
	        "8884": [0.13667, 0.63667, 0, 0],
	        "8885": [0.13667, 0.63667, 0, 0],
	        "8888": [0, 0.54986, 0, 0],
	        "8890": [0.19444, 0.43056, 0, 0],
	        "8891": [0.19444, 0.69224, 0, 0],
	        "8892": [0.19444, 0.69224, 0, 0],
	        "8901": [0, 0.54986, 0, 0],
	        "8903": [0.08167, 0.58167, 0, 0],
	        "8905": [0.08167, 0.58167, 0, 0],
	        "8906": [0.08167, 0.58167, 0, 0],
	        "8907": [0, 0.69224, 0, 0],
	        "8908": [0, 0.69224, 0, 0],
	        "8909": [-0.03598, 0.46402, 0, 0],
	        "8910": [0, 0.54986, 0, 0],
	        "8911": [0, 0.54986, 0, 0],
	        "8912": [0.03517, 0.54986, 0, 0],
	        "8913": [0.03517, 0.54986, 0, 0],
	        "8914": [0, 0.54986, 0, 0],
	        "8915": [0, 0.54986, 0, 0],
	        "8916": [0, 0.69224, 0, 0],
	        "8918": [0.0391, 0.5391, 0, 0],
	        "8919": [0.0391, 0.5391, 0, 0],
	        "8920": [0.03517, 0.54986, 0, 0],
	        "8921": [0.03517, 0.54986, 0, 0],
	        "8922": [0.38569, 0.88569, 0, 0],
	        "8923": [0.38569, 0.88569, 0, 0],
	        "8926": [0.13667, 0.63667, 0, 0],
	        "8927": [0.13667, 0.63667, 0, 0],
	        "8928": [0.30274, 0.79383, 0, 0],
	        "8929": [0.30274, 0.79383, 0, 0],
	        "8934": [0.23222, 0.74111, 0, 0],
	        "8935": [0.23222, 0.74111, 0, 0],
	        "8936": [0.23222, 0.74111, 0, 0],
	        "8937": [0.23222, 0.74111, 0, 0],
	        "8938": [0.20576, 0.70576, 0, 0],
	        "8939": [0.20576, 0.70576, 0, 0],
	        "8940": [0.30274, 0.79383, 0, 0],
	        "8941": [0.30274, 0.79383, 0, 0],
	        "8994": [0.19444, 0.69224, 0, 0],
	        "8995": [0.19444, 0.69224, 0, 0],
	        "9416": [0.15559, 0.69224, 0, 0],
	        "9484": [0, 0.69224, 0, 0],
	        "9488": [0, 0.69224, 0, 0],
	        "9492": [0, 0.37788, 0, 0],
	        "9496": [0, 0.37788, 0, 0],
	        "9585": [0.19444, 0.68889, 0, 0],
	        "9586": [0.19444, 0.74111, 0, 0],
	        "9632": [0, 0.675, 0, 0],
	        "9633": [0, 0.675, 0, 0],
	        "9650": [0, 0.54986, 0, 0],
	        "9651": [0, 0.54986, 0, 0],
	        "9654": [0.03517, 0.54986, 0, 0],
	        "9660": [0, 0.54986, 0, 0],
	        "9661": [0, 0.54986, 0, 0],
	        "9664": [0.03517, 0.54986, 0, 0],
	        "9674": [0.11111, 0.69224, 0, 0],
	        "9733": [0.19444, 0.69224, 0, 0],
	        "10003": [0, 0.69224, 0, 0],
	        "10016": [0, 0.69224, 0, 0],
	        "10731": [0.11111, 0.69224, 0, 0],
	        "10846": [0.19444, 0.75583, 0, 0],
	        "10877": [0.13667, 0.63667, 0, 0],
	        "10878": [0.13667, 0.63667, 0, 0],
	        "10885": [0.25583, 0.75583, 0, 0],
	        "10886": [0.25583, 0.75583, 0, 0],
	        "10887": [0.13597, 0.63597, 0, 0],
	        "10888": [0.13597, 0.63597, 0, 0],
	        "10889": [0.26167, 0.75726, 0, 0],
	        "10890": [0.26167, 0.75726, 0, 0],
	        "10891": [0.48256, 0.98256, 0, 0],
	        "10892": [0.48256, 0.98256, 0, 0],
	        "10901": [0.13667, 0.63667, 0, 0],
	        "10902": [0.13667, 0.63667, 0, 0],
	        "10933": [0.25142, 0.75726, 0, 0],
	        "10934": [0.25142, 0.75726, 0, 0],
	        "10935": [0.26167, 0.75726, 0, 0],
	        "10936": [0.26167, 0.75726, 0, 0],
	        "10937": [0.26167, 0.75726, 0, 0],
	        "10938": [0.26167, 0.75726, 0, 0],
	        "10949": [0.25583, 0.75583, 0, 0],
	        "10950": [0.25583, 0.75583, 0, 0],
	        "10955": [0.28481, 0.79383, 0, 0],
	        "10956": [0.28481, 0.79383, 0, 0],
	        "57350": [0.08167, 0.58167, 0, 0],
	        "57351": [0.08167, 0.58167, 0, 0],
	        "57352": [0.08167, 0.58167, 0, 0],
	        "57353": [0, 0.43056, 0.04028, 0],
	        "57356": [0.25142, 0.75726, 0, 0],
	        "57357": [0.25142, 0.75726, 0, 0],
	        "57358": [0.41951, 0.91951, 0, 0],
	        "57359": [0.30274, 0.79383, 0, 0],
	        "57360": [0.30274, 0.79383, 0, 0],
	        "57361": [0.41951, 0.91951, 0, 0],
	        "57366": [0.25142, 0.75726, 0, 0],
	        "57367": [0.25142, 0.75726, 0, 0],
	        "57368": [0.25142, 0.75726, 0, 0],
	        "57369": [0.25142, 0.75726, 0, 0],
	        "57370": [0.13597, 0.63597, 0, 0],
	        "57371": [0.13597, 0.63597, 0, 0],
	    },
	    "Caligraphic-Regular": {
	        "48": [0, 0.43056, 0, 0],
	        "49": [0, 0.43056, 0, 0],
	        "50": [0, 0.43056, 0, 0],
	        "51": [0.19444, 0.43056, 0, 0],
	        "52": [0.19444, 0.43056, 0, 0],
	        "53": [0.19444, 0.43056, 0, 0],
	        "54": [0, 0.64444, 0, 0],
	        "55": [0.19444, 0.43056, 0, 0],
	        "56": [0, 0.64444, 0, 0],
	        "57": [0.19444, 0.43056, 0, 0],
	        "65": [0, 0.68333, 0, 0.19445],
	        "66": [0, 0.68333, 0.03041, 0.13889],
	        "67": [0, 0.68333, 0.05834, 0.13889],
	        "68": [0, 0.68333, 0.02778, 0.08334],
	        "69": [0, 0.68333, 0.08944, 0.11111],
	        "70": [0, 0.68333, 0.09931, 0.11111],
	        "71": [0.09722, 0.68333, 0.0593, 0.11111],
	        "72": [0, 0.68333, 0.00965, 0.11111],
	        "73": [0, 0.68333, 0.07382, 0],
	        "74": [0.09722, 0.68333, 0.18472, 0.16667],
	        "75": [0, 0.68333, 0.01445, 0.05556],
	        "76": [0, 0.68333, 0, 0.13889],
	        "77": [0, 0.68333, 0, 0.13889],
	        "78": [0, 0.68333, 0.14736, 0.08334],
	        "79": [0, 0.68333, 0.02778, 0.11111],
	        "80": [0, 0.68333, 0.08222, 0.08334],
	        "81": [0.09722, 0.68333, 0, 0.11111],
	        "82": [0, 0.68333, 0, 0.08334],
	        "83": [0, 0.68333, 0.075, 0.13889],
	        "84": [0, 0.68333, 0.25417, 0],
	        "85": [0, 0.68333, 0.09931, 0.08334],
	        "86": [0, 0.68333, 0.08222, 0],
	        "87": [0, 0.68333, 0.08222, 0.08334],
	        "88": [0, 0.68333, 0.14643, 0.13889],
	        "89": [0.09722, 0.68333, 0.08222, 0.08334],
	        "90": [0, 0.68333, 0.07944, 0.13889],
	    },
	    "Fraktur-Regular": {
	        "33": [0, 0.69141, 0, 0],
	        "34": [0, 0.69141, 0, 0],
	        "38": [0, 0.69141, 0, 0],
	        "39": [0, 0.69141, 0, 0],
	        "40": [0.24982, 0.74947, 0, 0],
	        "41": [0.24982, 0.74947, 0, 0],
	        "42": [0, 0.62119, 0, 0],
	        "43": [0.08319, 0.58283, 0, 0],
	        "44": [0, 0.10803, 0, 0],
	        "45": [0.08319, 0.58283, 0, 0],
	        "46": [0, 0.10803, 0, 0],
	        "47": [0.24982, 0.74947, 0, 0],
	        "48": [0, 0.47534, 0, 0],
	        "49": [0, 0.47534, 0, 0],
	        "50": [0, 0.47534, 0, 0],
	        "51": [0.18906, 0.47534, 0, 0],
	        "52": [0.18906, 0.47534, 0, 0],
	        "53": [0.18906, 0.47534, 0, 0],
	        "54": [0, 0.69141, 0, 0],
	        "55": [0.18906, 0.47534, 0, 0],
	        "56": [0, 0.69141, 0, 0],
	        "57": [0.18906, 0.47534, 0, 0],
	        "58": [0, 0.47534, 0, 0],
	        "59": [0.12604, 0.47534, 0, 0],
	        "61": [-0.13099, 0.36866, 0, 0],
	        "63": [0, 0.69141, 0, 0],
	        "65": [0, 0.69141, 0, 0],
	        "66": [0, 0.69141, 0, 0],
	        "67": [0, 0.69141, 0, 0],
	        "68": [0, 0.69141, 0, 0],
	        "69": [0, 0.69141, 0, 0],
	        "70": [0.12604, 0.69141, 0, 0],
	        "71": [0, 0.69141, 0, 0],
	        "72": [0.06302, 0.69141, 0, 0],
	        "73": [0, 0.69141, 0, 0],
	        "74": [0.12604, 0.69141, 0, 0],
	        "75": [0, 0.69141, 0, 0],
	        "76": [0, 0.69141, 0, 0],
	        "77": [0, 0.69141, 0, 0],
	        "78": [0, 0.69141, 0, 0],
	        "79": [0, 0.69141, 0, 0],
	        "80": [0.18906, 0.69141, 0, 0],
	        "81": [0.03781, 0.69141, 0, 0],
	        "82": [0, 0.69141, 0, 0],
	        "83": [0, 0.69141, 0, 0],
	        "84": [0, 0.69141, 0, 0],
	        "85": [0, 0.69141, 0, 0],
	        "86": [0, 0.69141, 0, 0],
	        "87": [0, 0.69141, 0, 0],
	        "88": [0, 0.69141, 0, 0],
	        "89": [0.18906, 0.69141, 0, 0],
	        "90": [0.12604, 0.69141, 0, 0],
	        "91": [0.24982, 0.74947, 0, 0],
	        "93": [0.24982, 0.74947, 0, 0],
	        "94": [0, 0.69141, 0, 0],
	        "97": [0, 0.47534, 0, 0],
	        "98": [0, 0.69141, 0, 0],
	        "99": [0, 0.47534, 0, 0],
	        "100": [0, 0.62119, 0, 0],
	        "101": [0, 0.47534, 0, 0],
	        "102": [0.18906, 0.69141, 0, 0],
	        "103": [0.18906, 0.47534, 0, 0],
	        "104": [0.18906, 0.69141, 0, 0],
	        "105": [0, 0.69141, 0, 0],
	        "106": [0, 0.69141, 0, 0],
	        "107": [0, 0.69141, 0, 0],
	        "108": [0, 0.69141, 0, 0],
	        "109": [0, 0.47534, 0, 0],
	        "110": [0, 0.47534, 0, 0],
	        "111": [0, 0.47534, 0, 0],
	        "112": [0.18906, 0.52396, 0, 0],
	        "113": [0.18906, 0.47534, 0, 0],
	        "114": [0, 0.47534, 0, 0],
	        "115": [0, 0.47534, 0, 0],
	        "116": [0, 0.62119, 0, 0],
	        "117": [0, 0.47534, 0, 0],
	        "118": [0, 0.52396, 0, 0],
	        "119": [0, 0.52396, 0, 0],
	        "120": [0.18906, 0.47534, 0, 0],
	        "121": [0.18906, 0.47534, 0, 0],
	        "122": [0.18906, 0.47534, 0, 0],
	        "8216": [0, 0.69141, 0, 0],
	        "8217": [0, 0.69141, 0, 0],
	        "58112": [0, 0.62119, 0, 0],
	        "58113": [0, 0.62119, 0, 0],
	        "58114": [0.18906, 0.69141, 0, 0],
	        "58115": [0.18906, 0.69141, 0, 0],
	        "58116": [0.18906, 0.47534, 0, 0],
	        "58117": [0, 0.69141, 0, 0],
	        "58118": [0, 0.62119, 0, 0],
	        "58119": [0, 0.47534, 0, 0],
	    },
	    "Main-Bold": {
	        "33": [0, 0.69444, 0, 0],
	        "34": [0, 0.69444, 0, 0],
	        "35": [0.19444, 0.69444, 0, 0],
	        "36": [0.05556, 0.75, 0, 0],
	        "37": [0.05556, 0.75, 0, 0],
	        "38": [0, 0.69444, 0, 0],
	        "39": [0, 0.69444, 0, 0],
	        "40": [0.25, 0.75, 0, 0],
	        "41": [0.25, 0.75, 0, 0],
	        "42": [0, 0.75, 0, 0],
	        "43": [0.13333, 0.63333, 0, 0],
	        "44": [0.19444, 0.15556, 0, 0],
	        "45": [0, 0.44444, 0, 0],
	        "46": [0, 0.15556, 0, 0],
	        "47": [0.25, 0.75, 0, 0],
	        "48": [0, 0.64444, 0, 0],
	        "49": [0, 0.64444, 0, 0],
	        "50": [0, 0.64444, 0, 0],
	        "51": [0, 0.64444, 0, 0],
	        "52": [0, 0.64444, 0, 0],
	        "53": [0, 0.64444, 0, 0],
	        "54": [0, 0.64444, 0, 0],
	        "55": [0, 0.64444, 0, 0],
	        "56": [0, 0.64444, 0, 0],
	        "57": [0, 0.64444, 0, 0],
	        "58": [0, 0.44444, 0, 0],
	        "59": [0.19444, 0.44444, 0, 0],
	        "60": [0.08556, 0.58556, 0, 0],
	        "61": [-0.10889, 0.39111, 0, 0],
	        "62": [0.08556, 0.58556, 0, 0],
	        "63": [0, 0.69444, 0, 0],
	        "64": [0, 0.69444, 0, 0],
	        "65": [0, 0.68611, 0, 0],
	        "66": [0, 0.68611, 0, 0],
	        "67": [0, 0.68611, 0, 0],
	        "68": [0, 0.68611, 0, 0],
	        "69": [0, 0.68611, 0, 0],
	        "70": [0, 0.68611, 0, 0],
	        "71": [0, 0.68611, 0, 0],
	        "72": [0, 0.68611, 0, 0],
	        "73": [0, 0.68611, 0, 0],
	        "74": [0, 0.68611, 0, 0],
	        "75": [0, 0.68611, 0, 0],
	        "76": [0, 0.68611, 0, 0],
	        "77": [0, 0.68611, 0, 0],
	        "78": [0, 0.68611, 0, 0],
	        "79": [0, 0.68611, 0, 0],
	        "80": [0, 0.68611, 0, 0],
	        "81": [0.19444, 0.68611, 0, 0],
	        "82": [0, 0.68611, 0, 0],
	        "83": [0, 0.68611, 0, 0],
	        "84": [0, 0.68611, 0, 0],
	        "85": [0, 0.68611, 0, 0],
	        "86": [0, 0.68611, 0.01597, 0],
	        "87": [0, 0.68611, 0.01597, 0],
	        "88": [0, 0.68611, 0, 0],
	        "89": [0, 0.68611, 0.02875, 0],
	        "90": [0, 0.68611, 0, 0],
	        "91": [0.25, 0.75, 0, 0],
	        "92": [0.25, 0.75, 0, 0],
	        "93": [0.25, 0.75, 0, 0],
	        "94": [0, 0.69444, 0, 0],
	        "95": [0.31, 0.13444, 0.03194, 0],
	        "96": [0, 0.69444, 0, 0],
	        "97": [0, 0.44444, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.44444, 0, 0],
	        "100": [0, 0.69444, 0, 0],
	        "101": [0, 0.44444, 0, 0],
	        "102": [0, 0.69444, 0.10903, 0],
	        "103": [0.19444, 0.44444, 0.01597, 0],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.69444, 0, 0],
	        "106": [0.19444, 0.69444, 0, 0],
	        "107": [0, 0.69444, 0, 0],
	        "108": [0, 0.69444, 0, 0],
	        "109": [0, 0.44444, 0, 0],
	        "110": [0, 0.44444, 0, 0],
	        "111": [0, 0.44444, 0, 0],
	        "112": [0.19444, 0.44444, 0, 0],
	        "113": [0.19444, 0.44444, 0, 0],
	        "114": [0, 0.44444, 0, 0],
	        "115": [0, 0.44444, 0, 0],
	        "116": [0, 0.63492, 0, 0],
	        "117": [0, 0.44444, 0, 0],
	        "118": [0, 0.44444, 0.01597, 0],
	        "119": [0, 0.44444, 0.01597, 0],
	        "120": [0, 0.44444, 0, 0],
	        "121": [0.19444, 0.44444, 0.01597, 0],
	        "122": [0, 0.44444, 0, 0],
	        "123": [0.25, 0.75, 0, 0],
	        "124": [0.25, 0.75, 0, 0],
	        "125": [0.25, 0.75, 0, 0],
	        "126": [0.35, 0.34444, 0, 0],
	        "168": [0, 0.69444, 0, 0],
	        "172": [0, 0.44444, 0, 0],
	        "175": [0, 0.59611, 0, 0],
	        "176": [0, 0.69444, 0, 0],
	        "177": [0.13333, 0.63333, 0, 0],
	        "180": [0, 0.69444, 0, 0],
	        "215": [0.13333, 0.63333, 0, 0],
	        "247": [0.13333, 0.63333, 0, 0],
	        "305": [0, 0.44444, 0, 0],
	        "567": [0.19444, 0.44444, 0, 0],
	        "710": [0, 0.69444, 0, 0],
	        "711": [0, 0.63194, 0, 0],
	        "713": [0, 0.59611, 0, 0],
	        "714": [0, 0.69444, 0, 0],
	        "715": [0, 0.69444, 0, 0],
	        "728": [0, 0.69444, 0, 0],
	        "729": [0, 0.69444, 0, 0],
	        "730": [0, 0.69444, 0, 0],
	        "732": [0, 0.69444, 0, 0],
	        "768": [0, 0.69444, 0, 0],
	        "769": [0, 0.69444, 0, 0],
	        "770": [0, 0.69444, 0, 0],
	        "771": [0, 0.69444, 0, 0],
	        "772": [0, 0.59611, 0, 0],
	        "774": [0, 0.69444, 0, 0],
	        "775": [0, 0.69444, 0, 0],
	        "776": [0, 0.69444, 0, 0],
	        "778": [0, 0.69444, 0, 0],
	        "779": [0, 0.69444, 0, 0],
	        "780": [0, 0.63194, 0, 0],
	        "824": [0.19444, 0.69444, 0, 0],
	        "915": [0, 0.68611, 0, 0],
	        "916": [0, 0.68611, 0, 0],
	        "920": [0, 0.68611, 0, 0],
	        "923": [0, 0.68611, 0, 0],
	        "926": [0, 0.68611, 0, 0],
	        "928": [0, 0.68611, 0, 0],
	        "931": [0, 0.68611, 0, 0],
	        "933": [0, 0.68611, 0, 0],
	        "934": [0, 0.68611, 0, 0],
	        "936": [0, 0.68611, 0, 0],
	        "937": [0, 0.68611, 0, 0],
	        "8211": [0, 0.44444, 0.03194, 0],
	        "8212": [0, 0.44444, 0.03194, 0],
	        "8216": [0, 0.69444, 0, 0],
	        "8217": [0, 0.69444, 0, 0],
	        "8220": [0, 0.69444, 0, 0],
	        "8221": [0, 0.69444, 0, 0],
	        "8224": [0.19444, 0.69444, 0, 0],
	        "8225": [0.19444, 0.69444, 0, 0],
	        "8242": [0, 0.55556, 0, 0],
	        "8407": [0, 0.72444, 0.15486, 0],
	        "8463": [0, 0.69444, 0, 0],
	        "8465": [0, 0.69444, 0, 0],
	        "8467": [0, 0.69444, 0, 0],
	        "8472": [0.19444, 0.44444, 0, 0],
	        "8476": [0, 0.69444, 0, 0],
	        "8501": [0, 0.69444, 0, 0],
	        "8592": [-0.10889, 0.39111, 0, 0],
	        "8593": [0.19444, 0.69444, 0, 0],
	        "8594": [-0.10889, 0.39111, 0, 0],
	        "8595": [0.19444, 0.69444, 0, 0],
	        "8596": [-0.10889, 0.39111, 0, 0],
	        "8597": [0.25, 0.75, 0, 0],
	        "8598": [0.19444, 0.69444, 0, 0],
	        "8599": [0.19444, 0.69444, 0, 0],
	        "8600": [0.19444, 0.69444, 0, 0],
	        "8601": [0.19444, 0.69444, 0, 0],
	        "8636": [-0.10889, 0.39111, 0, 0],
	        "8637": [-0.10889, 0.39111, 0, 0],
	        "8640": [-0.10889, 0.39111, 0, 0],
	        "8641": [-0.10889, 0.39111, 0, 0],
	        "8656": [-0.10889, 0.39111, 0, 0],
	        "8657": [0.19444, 0.69444, 0, 0],
	        "8658": [-0.10889, 0.39111, 0, 0],
	        "8659": [0.19444, 0.69444, 0, 0],
	        "8660": [-0.10889, 0.39111, 0, 0],
	        "8661": [0.25, 0.75, 0, 0],
	        "8704": [0, 0.69444, 0, 0],
	        "8706": [0, 0.69444, 0.06389, 0],
	        "8707": [0, 0.69444, 0, 0],
	        "8709": [0.05556, 0.75, 0, 0],
	        "8711": [0, 0.68611, 0, 0],
	        "8712": [0.08556, 0.58556, 0, 0],
	        "8715": [0.08556, 0.58556, 0, 0],
	        "8722": [0.13333, 0.63333, 0, 0],
	        "8723": [0.13333, 0.63333, 0, 0],
	        "8725": [0.25, 0.75, 0, 0],
	        "8726": [0.25, 0.75, 0, 0],
	        "8727": [-0.02778, 0.47222, 0, 0],
	        "8728": [-0.02639, 0.47361, 0, 0],
	        "8729": [-0.02639, 0.47361, 0, 0],
	        "8730": [0.18, 0.82, 0, 0],
	        "8733": [0, 0.44444, 0, 0],
	        "8734": [0, 0.44444, 0, 0],
	        "8736": [0, 0.69224, 0, 0],
	        "8739": [0.25, 0.75, 0, 0],
	        "8741": [0.25, 0.75, 0, 0],
	        "8743": [0, 0.55556, 0, 0],
	        "8744": [0, 0.55556, 0, 0],
	        "8745": [0, 0.55556, 0, 0],
	        "8746": [0, 0.55556, 0, 0],
	        "8747": [0.19444, 0.69444, 0.12778, 0],
	        "8764": [-0.10889, 0.39111, 0, 0],
	        "8768": [0.19444, 0.69444, 0, 0],
	        "8771": [0.00222, 0.50222, 0, 0],
	        "8776": [0.02444, 0.52444, 0, 0],
	        "8781": [0.00222, 0.50222, 0, 0],
	        "8801": [0.00222, 0.50222, 0, 0],
	        "8804": [0.19667, 0.69667, 0, 0],
	        "8805": [0.19667, 0.69667, 0, 0],
	        "8810": [0.08556, 0.58556, 0, 0],
	        "8811": [0.08556, 0.58556, 0, 0],
	        "8826": [0.08556, 0.58556, 0, 0],
	        "8827": [0.08556, 0.58556, 0, 0],
	        "8834": [0.08556, 0.58556, 0, 0],
	        "8835": [0.08556, 0.58556, 0, 0],
	        "8838": [0.19667, 0.69667, 0, 0],
	        "8839": [0.19667, 0.69667, 0, 0],
	        "8846": [0, 0.55556, 0, 0],
	        "8849": [0.19667, 0.69667, 0, 0],
	        "8850": [0.19667, 0.69667, 0, 0],
	        "8851": [0, 0.55556, 0, 0],
	        "8852": [0, 0.55556, 0, 0],
	        "8853": [0.13333, 0.63333, 0, 0],
	        "8854": [0.13333, 0.63333, 0, 0],
	        "8855": [0.13333, 0.63333, 0, 0],
	        "8856": [0.13333, 0.63333, 0, 0],
	        "8857": [0.13333, 0.63333, 0, 0],
	        "8866": [0, 0.69444, 0, 0],
	        "8867": [0, 0.69444, 0, 0],
	        "8868": [0, 0.69444, 0, 0],
	        "8869": [0, 0.69444, 0, 0],
	        "8900": [-0.02639, 0.47361, 0, 0],
	        "8901": [-0.02639, 0.47361, 0, 0],
	        "8902": [-0.02778, 0.47222, 0, 0],
	        "8968": [0.25, 0.75, 0, 0],
	        "8969": [0.25, 0.75, 0, 0],
	        "8970": [0.25, 0.75, 0, 0],
	        "8971": [0.25, 0.75, 0, 0],
	        "8994": [-0.13889, 0.36111, 0, 0],
	        "8995": [-0.13889, 0.36111, 0, 0],
	        "9651": [0.19444, 0.69444, 0, 0],
	        "9657": [-0.02778, 0.47222, 0, 0],
	        "9661": [0.19444, 0.69444, 0, 0],
	        "9667": [-0.02778, 0.47222, 0, 0],
	        "9711": [0.19444, 0.69444, 0, 0],
	        "9824": [0.12963, 0.69444, 0, 0],
	        "9825": [0.12963, 0.69444, 0, 0],
	        "9826": [0.12963, 0.69444, 0, 0],
	        "9827": [0.12963, 0.69444, 0, 0],
	        "9837": [0, 0.75, 0, 0],
	        "9838": [0.19444, 0.69444, 0, 0],
	        "9839": [0.19444, 0.69444, 0, 0],
	        "10216": [0.25, 0.75, 0, 0],
	        "10217": [0.25, 0.75, 0, 0],
	        "10815": [0, 0.68611, 0, 0],
	        "10927": [0.19667, 0.69667, 0, 0],
	        "10928": [0.19667, 0.69667, 0, 0],
	    },
	    "Main-Italic": {
	        "33": [0, 0.69444, 0.12417, 0],
	        "34": [0, 0.69444, 0.06961, 0],
	        "35": [0.19444, 0.69444, 0.06616, 0],
	        "37": [0.05556, 0.75, 0.13639, 0],
	        "38": [0, 0.69444, 0.09694, 0],
	        "39": [0, 0.69444, 0.12417, 0],
	        "40": [0.25, 0.75, 0.16194, 0],
	        "41": [0.25, 0.75, 0.03694, 0],
	        "42": [0, 0.75, 0.14917, 0],
	        "43": [0.05667, 0.56167, 0.03694, 0],
	        "44": [0.19444, 0.10556, 0, 0],
	        "45": [0, 0.43056, 0.02826, 0],
	        "46": [0, 0.10556, 0, 0],
	        "47": [0.25, 0.75, 0.16194, 0],
	        "48": [0, 0.64444, 0.13556, 0],
	        "49": [0, 0.64444, 0.13556, 0],
	        "50": [0, 0.64444, 0.13556, 0],
	        "51": [0, 0.64444, 0.13556, 0],
	        "52": [0.19444, 0.64444, 0.13556, 0],
	        "53": [0, 0.64444, 0.13556, 0],
	        "54": [0, 0.64444, 0.13556, 0],
	        "55": [0.19444, 0.64444, 0.13556, 0],
	        "56": [0, 0.64444, 0.13556, 0],
	        "57": [0, 0.64444, 0.13556, 0],
	        "58": [0, 0.43056, 0.0582, 0],
	        "59": [0.19444, 0.43056, 0.0582, 0],
	        "61": [-0.13313, 0.36687, 0.06616, 0],
	        "63": [0, 0.69444, 0.1225, 0],
	        "64": [0, 0.69444, 0.09597, 0],
	        "65": [0, 0.68333, 0, 0],
	        "66": [0, 0.68333, 0.10257, 0],
	        "67": [0, 0.68333, 0.14528, 0],
	        "68": [0, 0.68333, 0.09403, 0],
	        "69": [0, 0.68333, 0.12028, 0],
	        "70": [0, 0.68333, 0.13305, 0],
	        "71": [0, 0.68333, 0.08722, 0],
	        "72": [0, 0.68333, 0.16389, 0],
	        "73": [0, 0.68333, 0.15806, 0],
	        "74": [0, 0.68333, 0.14028, 0],
	        "75": [0, 0.68333, 0.14528, 0],
	        "76": [0, 0.68333, 0, 0],
	        "77": [0, 0.68333, 0.16389, 0],
	        "78": [0, 0.68333, 0.16389, 0],
	        "79": [0, 0.68333, 0.09403, 0],
	        "80": [0, 0.68333, 0.10257, 0],
	        "81": [0.19444, 0.68333, 0.09403, 0],
	        "82": [0, 0.68333, 0.03868, 0],
	        "83": [0, 0.68333, 0.11972, 0],
	        "84": [0, 0.68333, 0.13305, 0],
	        "85": [0, 0.68333, 0.16389, 0],
	        "86": [0, 0.68333, 0.18361, 0],
	        "87": [0, 0.68333, 0.18361, 0],
	        "88": [0, 0.68333, 0.15806, 0],
	        "89": [0, 0.68333, 0.19383, 0],
	        "90": [0, 0.68333, 0.14528, 0],
	        "91": [0.25, 0.75, 0.1875, 0],
	        "93": [0.25, 0.75, 0.10528, 0],
	        "94": [0, 0.69444, 0.06646, 0],
	        "95": [0.31, 0.12056, 0.09208, 0],
	        "97": [0, 0.43056, 0.07671, 0],
	        "98": [0, 0.69444, 0.06312, 0],
	        "99": [0, 0.43056, 0.05653, 0],
	        "100": [0, 0.69444, 0.10333, 0],
	        "101": [0, 0.43056, 0.07514, 0],
	        "102": [0.19444, 0.69444, 0.21194, 0],
	        "103": [0.19444, 0.43056, 0.08847, 0],
	        "104": [0, 0.69444, 0.07671, 0],
	        "105": [0, 0.65536, 0.1019, 0],
	        "106": [0.19444, 0.65536, 0.14467, 0],
	        "107": [0, 0.69444, 0.10764, 0],
	        "108": [0, 0.69444, 0.10333, 0],
	        "109": [0, 0.43056, 0.07671, 0],
	        "110": [0, 0.43056, 0.07671, 0],
	        "111": [0, 0.43056, 0.06312, 0],
	        "112": [0.19444, 0.43056, 0.06312, 0],
	        "113": [0.19444, 0.43056, 0.08847, 0],
	        "114": [0, 0.43056, 0.10764, 0],
	        "115": [0, 0.43056, 0.08208, 0],
	        "116": [0, 0.61508, 0.09486, 0],
	        "117": [0, 0.43056, 0.07671, 0],
	        "118": [0, 0.43056, 0.10764, 0],
	        "119": [0, 0.43056, 0.10764, 0],
	        "120": [0, 0.43056, 0.12042, 0],
	        "121": [0.19444, 0.43056, 0.08847, 0],
	        "122": [0, 0.43056, 0.12292, 0],
	        "126": [0.35, 0.31786, 0.11585, 0],
	        "163": [0, 0.69444, 0, 0],
	        "305": [0, 0.43056, 0, 0.02778],
	        "567": [0.19444, 0.43056, 0, 0.08334],
	        "768": [0, 0.69444, 0, 0],
	        "769": [0, 0.69444, 0.09694, 0],
	        "770": [0, 0.69444, 0.06646, 0],
	        "771": [0, 0.66786, 0.11585, 0],
	        "772": [0, 0.56167, 0.10333, 0],
	        "774": [0, 0.69444, 0.10806, 0],
	        "775": [0, 0.66786, 0.11752, 0],
	        "776": [0, 0.66786, 0.10474, 0],
	        "778": [0, 0.69444, 0, 0],
	        "779": [0, 0.69444, 0.1225, 0],
	        "780": [0, 0.62847, 0.08295, 0],
	        "915": [0, 0.68333, 0.13305, 0],
	        "916": [0, 0.68333, 0, 0],
	        "920": [0, 0.68333, 0.09403, 0],
	        "923": [0, 0.68333, 0, 0],
	        "926": [0, 0.68333, 0.15294, 0],
	        "928": [0, 0.68333, 0.16389, 0],
	        "931": [0, 0.68333, 0.12028, 0],
	        "933": [0, 0.68333, 0.11111, 0],
	        "934": [0, 0.68333, 0.05986, 0],
	        "936": [0, 0.68333, 0.11111, 0],
	        "937": [0, 0.68333, 0.10257, 0],
	        "8211": [0, 0.43056, 0.09208, 0],
	        "8212": [0, 0.43056, 0.09208, 0],
	        "8216": [0, 0.69444, 0.12417, 0],
	        "8217": [0, 0.69444, 0.12417, 0],
	        "8220": [0, 0.69444, 0.1685, 0],
	        "8221": [0, 0.69444, 0.06961, 0],
	        "8463": [0, 0.68889, 0, 0],
	    },
	    "Main-Regular": {
	        "32": [0, 0, 0, 0],
	        "33": [0, 0.69444, 0, 0],
	        "34": [0, 0.69444, 0, 0],
	        "35": [0.19444, 0.69444, 0, 0],
	        "36": [0.05556, 0.75, 0, 0],
	        "37": [0.05556, 0.75, 0, 0],
	        "38": [0, 0.69444, 0, 0],
	        "39": [0, 0.69444, 0, 0],
	        "40": [0.25, 0.75, 0, 0],
	        "41": [0.25, 0.75, 0, 0],
	        "42": [0, 0.75, 0, 0],
	        "43": [0.08333, 0.58333, 0, 0],
	        "44": [0.19444, 0.10556, 0, 0],
	        "45": [0, 0.43056, 0, 0],
	        "46": [0, 0.10556, 0, 0],
	        "47": [0.25, 0.75, 0, 0],
	        "48": [0, 0.64444, 0, 0],
	        "49": [0, 0.64444, 0, 0],
	        "50": [0, 0.64444, 0, 0],
	        "51": [0, 0.64444, 0, 0],
	        "52": [0, 0.64444, 0, 0],
	        "53": [0, 0.64444, 0, 0],
	        "54": [0, 0.64444, 0, 0],
	        "55": [0, 0.64444, 0, 0],
	        "56": [0, 0.64444, 0, 0],
	        "57": [0, 0.64444, 0, 0],
	        "58": [0, 0.43056, 0, 0],
	        "59": [0.19444, 0.43056, 0, 0],
	        "60": [0.0391, 0.5391, 0, 0],
	        "61": [-0.13313, 0.36687, 0, 0],
	        "62": [0.0391, 0.5391, 0, 0],
	        "63": [0, 0.69444, 0, 0],
	        "64": [0, 0.69444, 0, 0],
	        "65": [0, 0.68333, 0, 0],
	        "66": [0, 0.68333, 0, 0],
	        "67": [0, 0.68333, 0, 0],
	        "68": [0, 0.68333, 0, 0],
	        "69": [0, 0.68333, 0, 0],
	        "70": [0, 0.68333, 0, 0],
	        "71": [0, 0.68333, 0, 0],
	        "72": [0, 0.68333, 0, 0],
	        "73": [0, 0.68333, 0, 0],
	        "74": [0, 0.68333, 0, 0],
	        "75": [0, 0.68333, 0, 0],
	        "76": [0, 0.68333, 0, 0],
	        "77": [0, 0.68333, 0, 0],
	        "78": [0, 0.68333, 0, 0],
	        "79": [0, 0.68333, 0, 0],
	        "80": [0, 0.68333, 0, 0],
	        "81": [0.19444, 0.68333, 0, 0],
	        "82": [0, 0.68333, 0, 0],
	        "83": [0, 0.68333, 0, 0],
	        "84": [0, 0.68333, 0, 0],
	        "85": [0, 0.68333, 0, 0],
	        "86": [0, 0.68333, 0.01389, 0],
	        "87": [0, 0.68333, 0.01389, 0],
	        "88": [0, 0.68333, 0, 0],
	        "89": [0, 0.68333, 0.025, 0],
	        "90": [0, 0.68333, 0, 0],
	        "91": [0.25, 0.75, 0, 0],
	        "92": [0.25, 0.75, 0, 0],
	        "93": [0.25, 0.75, 0, 0],
	        "94": [0, 0.69444, 0, 0],
	        "95": [0.31, 0.12056, 0.02778, 0],
	        "96": [0, 0.69444, 0, 0],
	        "97": [0, 0.43056, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.43056, 0, 0],
	        "100": [0, 0.69444, 0, 0],
	        "101": [0, 0.43056, 0, 0],
	        "102": [0, 0.69444, 0.07778, 0],
	        "103": [0.19444, 0.43056, 0.01389, 0],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.66786, 0, 0],
	        "106": [0.19444, 0.66786, 0, 0],
	        "107": [0, 0.69444, 0, 0],
	        "108": [0, 0.69444, 0, 0],
	        "109": [0, 0.43056, 0, 0],
	        "110": [0, 0.43056, 0, 0],
	        "111": [0, 0.43056, 0, 0],
	        "112": [0.19444, 0.43056, 0, 0],
	        "113": [0.19444, 0.43056, 0, 0],
	        "114": [0, 0.43056, 0, 0],
	        "115": [0, 0.43056, 0, 0],
	        "116": [0, 0.61508, 0, 0],
	        "117": [0, 0.43056, 0, 0],
	        "118": [0, 0.43056, 0.01389, 0],
	        "119": [0, 0.43056, 0.01389, 0],
	        "120": [0, 0.43056, 0, 0],
	        "121": [0.19444, 0.43056, 0.01389, 0],
	        "122": [0, 0.43056, 0, 0],
	        "123": [0.25, 0.75, 0, 0],
	        "124": [0.25, 0.75, 0, 0],
	        "125": [0.25, 0.75, 0, 0],
	        "126": [0.35, 0.31786, 0, 0],
	        "160": [0, 0, 0, 0],
	        "168": [0, 0.66786, 0, 0],
	        "172": [0, 0.43056, 0, 0],
	        "175": [0, 0.56778, 0, 0],
	        "176": [0, 0.69444, 0, 0],
	        "177": [0.08333, 0.58333, 0, 0],
	        "180": [0, 0.69444, 0, 0],
	        "215": [0.08333, 0.58333, 0, 0],
	        "247": [0.08333, 0.58333, 0, 0],
	        "305": [0, 0.43056, 0, 0],
	        "567": [0.19444, 0.43056, 0, 0],
	        "710": [0, 0.69444, 0, 0],
	        "711": [0, 0.62847, 0, 0],
	        "713": [0, 0.56778, 0, 0],
	        "714": [0, 0.69444, 0, 0],
	        "715": [0, 0.69444, 0, 0],
	        "728": [0, 0.69444, 0, 0],
	        "729": [0, 0.66786, 0, 0],
	        "730": [0, 0.69444, 0, 0],
	        "732": [0, 0.66786, 0, 0],
	        "768": [0, 0.69444, 0, 0],
	        "769": [0, 0.69444, 0, 0],
	        "770": [0, 0.69444, 0, 0],
	        "771": [0, 0.66786, 0, 0],
	        "772": [0, 0.56778, 0, 0],
	        "774": [0, 0.69444, 0, 0],
	        "775": [0, 0.66786, 0, 0],
	        "776": [0, 0.66786, 0, 0],
	        "778": [0, 0.69444, 0, 0],
	        "779": [0, 0.69444, 0, 0],
	        "780": [0, 0.62847, 0, 0],
	        "824": [0.19444, 0.69444, 0, 0],
	        "915": [0, 0.68333, 0, 0],
	        "916": [0, 0.68333, 0, 0],
	        "920": [0, 0.68333, 0, 0],
	        "923": [0, 0.68333, 0, 0],
	        "926": [0, 0.68333, 0, 0],
	        "928": [0, 0.68333, 0, 0],
	        "931": [0, 0.68333, 0, 0],
	        "933": [0, 0.68333, 0, 0],
	        "934": [0, 0.68333, 0, 0],
	        "936": [0, 0.68333, 0, 0],
	        "937": [0, 0.68333, 0, 0],
	        "8211": [0, 0.43056, 0.02778, 0],
	        "8212": [0, 0.43056, 0.02778, 0],
	        "8216": [0, 0.69444, 0, 0],
	        "8217": [0, 0.69444, 0, 0],
	        "8220": [0, 0.69444, 0, 0],
	        "8221": [0, 0.69444, 0, 0],
	        "8224": [0.19444, 0.69444, 0, 0],
	        "8225": [0.19444, 0.69444, 0, 0],
	        "8230": [0, 0.12, 0, 0],
	        "8242": [0, 0.55556, 0, 0],
	        "8407": [0, 0.71444, 0.15382, 0],
	        "8463": [0, 0.68889, 0, 0],
	        "8465": [0, 0.69444, 0, 0],
	        "8467": [0, 0.69444, 0, 0.11111],
	        "8472": [0.19444, 0.43056, 0, 0.11111],
	        "8476": [0, 0.69444, 0, 0],
	        "8501": [0, 0.69444, 0, 0],
	        "8592": [-0.13313, 0.36687, 0, 0],
	        "8593": [0.19444, 0.69444, 0, 0],
	        "8594": [-0.13313, 0.36687, 0, 0],
	        "8595": [0.19444, 0.69444, 0, 0],
	        "8596": [-0.13313, 0.36687, 0, 0],
	        "8597": [0.25, 0.75, 0, 0],
	        "8598": [0.19444, 0.69444, 0, 0],
	        "8599": [0.19444, 0.69444, 0, 0],
	        "8600": [0.19444, 0.69444, 0, 0],
	        "8601": [0.19444, 0.69444, 0, 0],
	        "8614": [0.011, 0.511, 0, 0],
	        "8617": [0.011, 0.511, 0, 0],
	        "8618": [0.011, 0.511, 0, 0],
	        "8636": [-0.13313, 0.36687, 0, 0],
	        "8637": [-0.13313, 0.36687, 0, 0],
	        "8640": [-0.13313, 0.36687, 0, 0],
	        "8641": [-0.13313, 0.36687, 0, 0],
	        "8652": [0.011, 0.671, 0, 0],
	        "8656": [-0.13313, 0.36687, 0, 0],
	        "8657": [0.19444, 0.69444, 0, 0],
	        "8658": [-0.13313, 0.36687, 0, 0],
	        "8659": [0.19444, 0.69444, 0, 0],
	        "8660": [-0.13313, 0.36687, 0, 0],
	        "8661": [0.25, 0.75, 0, 0],
	        "8704": [0, 0.69444, 0, 0],
	        "8706": [0, 0.69444, 0.05556, 0.08334],
	        "8707": [0, 0.69444, 0, 0],
	        "8709": [0.05556, 0.75, 0, 0],
	        "8711": [0, 0.68333, 0, 0],
	        "8712": [0.0391, 0.5391, 0, 0],
	        "8715": [0.0391, 0.5391, 0, 0],
	        "8722": [0.08333, 0.58333, 0, 0],
	        "8723": [0.08333, 0.58333, 0, 0],
	        "8725": [0.25, 0.75, 0, 0],
	        "8726": [0.25, 0.75, 0, 0],
	        "8727": [-0.03472, 0.46528, 0, 0],
	        "8728": [-0.05555, 0.44445, 0, 0],
	        "8729": [-0.05555, 0.44445, 0, 0],
	        "8730": [0.2, 0.8, 0, 0],
	        "8733": [0, 0.43056, 0, 0],
	        "8734": [0, 0.43056, 0, 0],
	        "8736": [0, 0.69224, 0, 0],
	        "8739": [0.25, 0.75, 0, 0],
	        "8741": [0.25, 0.75, 0, 0],
	        "8743": [0, 0.55556, 0, 0],
	        "8744": [0, 0.55556, 0, 0],
	        "8745": [0, 0.55556, 0, 0],
	        "8746": [0, 0.55556, 0, 0],
	        "8747": [0.19444, 0.69444, 0.11111, 0],
	        "8764": [-0.13313, 0.36687, 0, 0],
	        "8768": [0.19444, 0.69444, 0, 0],
	        "8771": [-0.03625, 0.46375, 0, 0],
	        "8773": [-0.022, 0.589, 0, 0],
	        "8776": [-0.01688, 0.48312, 0, 0],
	        "8781": [-0.03625, 0.46375, 0, 0],
	        "8784": [-0.133, 0.67, 0, 0],
	        "8800": [0.215, 0.716, 0, 0],
	        "8801": [-0.03625, 0.46375, 0, 0],
	        "8804": [0.13597, 0.63597, 0, 0],
	        "8805": [0.13597, 0.63597, 0, 0],
	        "8810": [0.0391, 0.5391, 0, 0],
	        "8811": [0.0391, 0.5391, 0, 0],
	        "8826": [0.0391, 0.5391, 0, 0],
	        "8827": [0.0391, 0.5391, 0, 0],
	        "8834": [0.0391, 0.5391, 0, 0],
	        "8835": [0.0391, 0.5391, 0, 0],
	        "8838": [0.13597, 0.63597, 0, 0],
	        "8839": [0.13597, 0.63597, 0, 0],
	        "8846": [0, 0.55556, 0, 0],
	        "8849": [0.13597, 0.63597, 0, 0],
	        "8850": [0.13597, 0.63597, 0, 0],
	        "8851": [0, 0.55556, 0, 0],
	        "8852": [0, 0.55556, 0, 0],
	        "8853": [0.08333, 0.58333, 0, 0],
	        "8854": [0.08333, 0.58333, 0, 0],
	        "8855": [0.08333, 0.58333, 0, 0],
	        "8856": [0.08333, 0.58333, 0, 0],
	        "8857": [0.08333, 0.58333, 0, 0],
	        "8866": [0, 0.69444, 0, 0],
	        "8867": [0, 0.69444, 0, 0],
	        "8868": [0, 0.69444, 0, 0],
	        "8869": [0, 0.69444, 0, 0],
	        "8872": [0.249, 0.75, 0, 0],
	        "8900": [-0.05555, 0.44445, 0, 0],
	        "8901": [-0.05555, 0.44445, 0, 0],
	        "8902": [-0.03472, 0.46528, 0, 0],
	        "8904": [0.005, 0.505, 0, 0],
	        "8942": [0.03, 0.9, 0, 0],
	        "8943": [-0.19, 0.31, 0, 0],
	        "8945": [-0.1, 0.82, 0, 0],
	        "8968": [0.25, 0.75, 0, 0],
	        "8969": [0.25, 0.75, 0, 0],
	        "8970": [0.25, 0.75, 0, 0],
	        "8971": [0.25, 0.75, 0, 0],
	        "8994": [-0.14236, 0.35764, 0, 0],
	        "8995": [-0.14236, 0.35764, 0, 0],
	        "9136": [0.244, 0.744, 0, 0],
	        "9137": [0.244, 0.744, 0, 0],
	        "9651": [0.19444, 0.69444, 0, 0],
	        "9657": [-0.03472, 0.46528, 0, 0],
	        "9661": [0.19444, 0.69444, 0, 0],
	        "9667": [-0.03472, 0.46528, 0, 0],
	        "9711": [0.19444, 0.69444, 0, 0],
	        "9824": [0.12963, 0.69444, 0, 0],
	        "9825": [0.12963, 0.69444, 0, 0],
	        "9826": [0.12963, 0.69444, 0, 0],
	        "9827": [0.12963, 0.69444, 0, 0],
	        "9837": [0, 0.75, 0, 0],
	        "9838": [0.19444, 0.69444, 0, 0],
	        "9839": [0.19444, 0.69444, 0, 0],
	        "10216": [0.25, 0.75, 0, 0],
	        "10217": [0.25, 0.75, 0, 0],
	        "10222": [0.244, 0.744, 0, 0],
	        "10223": [0.244, 0.744, 0, 0],
	        "10229": [0.011, 0.511, 0, 0],
	        "10230": [0.011, 0.511, 0, 0],
	        "10231": [0.011, 0.511, 0, 0],
	        "10232": [0.024, 0.525, 0, 0],
	        "10233": [0.024, 0.525, 0, 0],
	        "10234": [0.024, 0.525, 0, 0],
	        "10236": [0.011, 0.511, 0, 0],
	        "10815": [0, 0.68333, 0, 0],
	        "10927": [0.13597, 0.63597, 0, 0],
	        "10928": [0.13597, 0.63597, 0, 0],
	    },
	    "Math-BoldItalic": {
	        "47": [0.19444, 0.69444, 0, 0],
	        "65": [0, 0.68611, 0, 0],
	        "66": [0, 0.68611, 0.04835, 0],
	        "67": [0, 0.68611, 0.06979, 0],
	        "68": [0, 0.68611, 0.03194, 0],
	        "69": [0, 0.68611, 0.05451, 0],
	        "70": [0, 0.68611, 0.15972, 0],
	        "71": [0, 0.68611, 0, 0],
	        "72": [0, 0.68611, 0.08229, 0],
	        "73": [0, 0.68611, 0.07778, 0],
	        "74": [0, 0.68611, 0.10069, 0],
	        "75": [0, 0.68611, 0.06979, 0],
	        "76": [0, 0.68611, 0, 0],
	        "77": [0, 0.68611, 0.11424, 0],
	        "78": [0, 0.68611, 0.11424, 0],
	        "79": [0, 0.68611, 0.03194, 0],
	        "80": [0, 0.68611, 0.15972, 0],
	        "81": [0.19444, 0.68611, 0, 0],
	        "82": [0, 0.68611, 0.00421, 0],
	        "83": [0, 0.68611, 0.05382, 0],
	        "84": [0, 0.68611, 0.15972, 0],
	        "85": [0, 0.68611, 0.11424, 0],
	        "86": [0, 0.68611, 0.25555, 0],
	        "87": [0, 0.68611, 0.15972, 0],
	        "88": [0, 0.68611, 0.07778, 0],
	        "89": [0, 0.68611, 0.25555, 0],
	        "90": [0, 0.68611, 0.06979, 0],
	        "97": [0, 0.44444, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.44444, 0, 0],
	        "100": [0, 0.69444, 0, 0],
	        "101": [0, 0.44444, 0, 0],
	        "102": [0.19444, 0.69444, 0.11042, 0],
	        "103": [0.19444, 0.44444, 0.03704, 0],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.69326, 0, 0],
	        "106": [0.19444, 0.69326, 0.0622, 0],
	        "107": [0, 0.69444, 0.01852, 0],
	        "108": [0, 0.69444, 0.0088, 0],
	        "109": [0, 0.44444, 0, 0],
	        "110": [0, 0.44444, 0, 0],
	        "111": [0, 0.44444, 0, 0],
	        "112": [0.19444, 0.44444, 0, 0],
	        "113": [0.19444, 0.44444, 0.03704, 0],
	        "114": [0, 0.44444, 0.03194, 0],
	        "115": [0, 0.44444, 0, 0],
	        "116": [0, 0.63492, 0, 0],
	        "117": [0, 0.44444, 0, 0],
	        "118": [0, 0.44444, 0.03704, 0],
	        "119": [0, 0.44444, 0.02778, 0],
	        "120": [0, 0.44444, 0, 0],
	        "121": [0.19444, 0.44444, 0.03704, 0],
	        "122": [0, 0.44444, 0.04213, 0],
	        "915": [0, 0.68611, 0.15972, 0],
	        "916": [0, 0.68611, 0, 0],
	        "920": [0, 0.68611, 0.03194, 0],
	        "923": [0, 0.68611, 0, 0],
	        "926": [0, 0.68611, 0.07458, 0],
	        "928": [0, 0.68611, 0.08229, 0],
	        "931": [0, 0.68611, 0.05451, 0],
	        "933": [0, 0.68611, 0.15972, 0],
	        "934": [0, 0.68611, 0, 0],
	        "936": [0, 0.68611, 0.11653, 0],
	        "937": [0, 0.68611, 0.04835, 0],
	        "945": [0, 0.44444, 0, 0],
	        "946": [0.19444, 0.69444, 0.03403, 0],
	        "947": [0.19444, 0.44444, 0.06389, 0],
	        "948": [0, 0.69444, 0.03819, 0],
	        "949": [0, 0.44444, 0, 0],
	        "950": [0.19444, 0.69444, 0.06215, 0],
	        "951": [0.19444, 0.44444, 0.03704, 0],
	        "952": [0, 0.69444, 0.03194, 0],
	        "953": [0, 0.44444, 0, 0],
	        "954": [0, 0.44444, 0, 0],
	        "955": [0, 0.69444, 0, 0],
	        "956": [0.19444, 0.44444, 0, 0],
	        "957": [0, 0.44444, 0.06898, 0],
	        "958": [0.19444, 0.69444, 0.03021, 0],
	        "959": [0, 0.44444, 0, 0],
	        "960": [0, 0.44444, 0.03704, 0],
	        "961": [0.19444, 0.44444, 0, 0],
	        "962": [0.09722, 0.44444, 0.07917, 0],
	        "963": [0, 0.44444, 0.03704, 0],
	        "964": [0, 0.44444, 0.13472, 0],
	        "965": [0, 0.44444, 0.03704, 0],
	        "966": [0.19444, 0.44444, 0, 0],
	        "967": [0.19444, 0.44444, 0, 0],
	        "968": [0.19444, 0.69444, 0.03704, 0],
	        "969": [0, 0.44444, 0.03704, 0],
	        "977": [0, 0.69444, 0, 0],
	        "981": [0.19444, 0.69444, 0, 0],
	        "982": [0, 0.44444, 0.03194, 0],
	        "1009": [0.19444, 0.44444, 0, 0],
	        "1013": [0, 0.44444, 0, 0],
	    },
	    "Math-Italic": {
	        "47": [0.19444, 0.69444, 0, 0],
	        "65": [0, 0.68333, 0, 0.13889],
	        "66": [0, 0.68333, 0.05017, 0.08334],
	        "67": [0, 0.68333, 0.07153, 0.08334],
	        "68": [0, 0.68333, 0.02778, 0.05556],
	        "69": [0, 0.68333, 0.05764, 0.08334],
	        "70": [0, 0.68333, 0.13889, 0.08334],
	        "71": [0, 0.68333, 0, 0.08334],
	        "72": [0, 0.68333, 0.08125, 0.05556],
	        "73": [0, 0.68333, 0.07847, 0.11111],
	        "74": [0, 0.68333, 0.09618, 0.16667],
	        "75": [0, 0.68333, 0.07153, 0.05556],
	        "76": [0, 0.68333, 0, 0.02778],
	        "77": [0, 0.68333, 0.10903, 0.08334],
	        "78": [0, 0.68333, 0.10903, 0.08334],
	        "79": [0, 0.68333, 0.02778, 0.08334],
	        "80": [0, 0.68333, 0.13889, 0.08334],
	        "81": [0.19444, 0.68333, 0, 0.08334],
	        "82": [0, 0.68333, 0.00773, 0.08334],
	        "83": [0, 0.68333, 0.05764, 0.08334],
	        "84": [0, 0.68333, 0.13889, 0.08334],
	        "85": [0, 0.68333, 0.10903, 0.02778],
	        "86": [0, 0.68333, 0.22222, 0],
	        "87": [0, 0.68333, 0.13889, 0],
	        "88": [0, 0.68333, 0.07847, 0.08334],
	        "89": [0, 0.68333, 0.22222, 0],
	        "90": [0, 0.68333, 0.07153, 0.08334],
	        "97": [0, 0.43056, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.43056, 0, 0.05556],
	        "100": [0, 0.69444, 0, 0.16667],
	        "101": [0, 0.43056, 0, 0.05556],
	        "102": [0.19444, 0.69444, 0.10764, 0.16667],
	        "103": [0.19444, 0.43056, 0.03588, 0.02778],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.65952, 0, 0],
	        "106": [0.19444, 0.65952, 0.05724, 0],
	        "107": [0, 0.69444, 0.03148, 0],
	        "108": [0, 0.69444, 0.01968, 0.08334],
	        "109": [0, 0.43056, 0, 0],
	        "110": [0, 0.43056, 0, 0],
	        "111": [0, 0.43056, 0, 0.05556],
	        "112": [0.19444, 0.43056, 0, 0.08334],
	        "113": [0.19444, 0.43056, 0.03588, 0.08334],
	        "114": [0, 0.43056, 0.02778, 0.05556],
	        "115": [0, 0.43056, 0, 0.05556],
	        "116": [0, 0.61508, 0, 0.08334],
	        "117": [0, 0.43056, 0, 0.02778],
	        "118": [0, 0.43056, 0.03588, 0.02778],
	        "119": [0, 0.43056, 0.02691, 0.08334],
	        "120": [0, 0.43056, 0, 0.02778],
	        "121": [0.19444, 0.43056, 0.03588, 0.05556],
	        "122": [0, 0.43056, 0.04398, 0.05556],
	        "915": [0, 0.68333, 0.13889, 0.08334],
	        "916": [0, 0.68333, 0, 0.16667],
	        "920": [0, 0.68333, 0.02778, 0.08334],
	        "923": [0, 0.68333, 0, 0.16667],
	        "926": [0, 0.68333, 0.07569, 0.08334],
	        "928": [0, 0.68333, 0.08125, 0.05556],
	        "931": [0, 0.68333, 0.05764, 0.08334],
	        "933": [0, 0.68333, 0.13889, 0.05556],
	        "934": [0, 0.68333, 0, 0.08334],
	        "936": [0, 0.68333, 0.11, 0.05556],
	        "937": [0, 0.68333, 0.05017, 0.08334],
	        "945": [0, 0.43056, 0.0037, 0.02778],
	        "946": [0.19444, 0.69444, 0.05278, 0.08334],
	        "947": [0.19444, 0.43056, 0.05556, 0],
	        "948": [0, 0.69444, 0.03785, 0.05556],
	        "949": [0, 0.43056, 0, 0.08334],
	        "950": [0.19444, 0.69444, 0.07378, 0.08334],
	        "951": [0.19444, 0.43056, 0.03588, 0.05556],
	        "952": [0, 0.69444, 0.02778, 0.08334],
	        "953": [0, 0.43056, 0, 0.05556],
	        "954": [0, 0.43056, 0, 0],
	        "955": [0, 0.69444, 0, 0],
	        "956": [0.19444, 0.43056, 0, 0.02778],
	        "957": [0, 0.43056, 0.06366, 0.02778],
	        "958": [0.19444, 0.69444, 0.04601, 0.11111],
	        "959": [0, 0.43056, 0, 0.05556],
	        "960": [0, 0.43056, 0.03588, 0],
	        "961": [0.19444, 0.43056, 0, 0.08334],
	        "962": [0.09722, 0.43056, 0.07986, 0.08334],
	        "963": [0, 0.43056, 0.03588, 0],
	        "964": [0, 0.43056, 0.1132, 0.02778],
	        "965": [0, 0.43056, 0.03588, 0.02778],
	        "966": [0.19444, 0.43056, 0, 0.08334],
	        "967": [0.19444, 0.43056, 0, 0.05556],
	        "968": [0.19444, 0.69444, 0.03588, 0.11111],
	        "969": [0, 0.43056, 0.03588, 0],
	        "977": [0, 0.69444, 0, 0.08334],
	        "981": [0.19444, 0.69444, 0, 0.08334],
	        "982": [0, 0.43056, 0.02778, 0],
	        "1009": [0.19444, 0.43056, 0, 0.08334],
	        "1013": [0, 0.43056, 0, 0.05556],
	    },
	    "Math-Regular": {
	        "65": [0, 0.68333, 0, 0.13889],
	        "66": [0, 0.68333, 0.05017, 0.08334],
	        "67": [0, 0.68333, 0.07153, 0.08334],
	        "68": [0, 0.68333, 0.02778, 0.05556],
	        "69": [0, 0.68333, 0.05764, 0.08334],
	        "70": [0, 0.68333, 0.13889, 0.08334],
	        "71": [0, 0.68333, 0, 0.08334],
	        "72": [0, 0.68333, 0.08125, 0.05556],
	        "73": [0, 0.68333, 0.07847, 0.11111],
	        "74": [0, 0.68333, 0.09618, 0.16667],
	        "75": [0, 0.68333, 0.07153, 0.05556],
	        "76": [0, 0.68333, 0, 0.02778],
	        "77": [0, 0.68333, 0.10903, 0.08334],
	        "78": [0, 0.68333, 0.10903, 0.08334],
	        "79": [0, 0.68333, 0.02778, 0.08334],
	        "80": [0, 0.68333, 0.13889, 0.08334],
	        "81": [0.19444, 0.68333, 0, 0.08334],
	        "82": [0, 0.68333, 0.00773, 0.08334],
	        "83": [0, 0.68333, 0.05764, 0.08334],
	        "84": [0, 0.68333, 0.13889, 0.08334],
	        "85": [0, 0.68333, 0.10903, 0.02778],
	        "86": [0, 0.68333, 0.22222, 0],
	        "87": [0, 0.68333, 0.13889, 0],
	        "88": [0, 0.68333, 0.07847, 0.08334],
	        "89": [0, 0.68333, 0.22222, 0],
	        "90": [0, 0.68333, 0.07153, 0.08334],
	        "97": [0, 0.43056, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.43056, 0, 0.05556],
	        "100": [0, 0.69444, 0, 0.16667],
	        "101": [0, 0.43056, 0, 0.05556],
	        "102": [0.19444, 0.69444, 0.10764, 0.16667],
	        "103": [0.19444, 0.43056, 0.03588, 0.02778],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.65952, 0, 0],
	        "106": [0.19444, 0.65952, 0.05724, 0],
	        "107": [0, 0.69444, 0.03148, 0],
	        "108": [0, 0.69444, 0.01968, 0.08334],
	        "109": [0, 0.43056, 0, 0],
	        "110": [0, 0.43056, 0, 0],
	        "111": [0, 0.43056, 0, 0.05556],
	        "112": [0.19444, 0.43056, 0, 0.08334],
	        "113": [0.19444, 0.43056, 0.03588, 0.08334],
	        "114": [0, 0.43056, 0.02778, 0.05556],
	        "115": [0, 0.43056, 0, 0.05556],
	        "116": [0, 0.61508, 0, 0.08334],
	        "117": [0, 0.43056, 0, 0.02778],
	        "118": [0, 0.43056, 0.03588, 0.02778],
	        "119": [0, 0.43056, 0.02691, 0.08334],
	        "120": [0, 0.43056, 0, 0.02778],
	        "121": [0.19444, 0.43056, 0.03588, 0.05556],
	        "122": [0, 0.43056, 0.04398, 0.05556],
	        "915": [0, 0.68333, 0.13889, 0.08334],
	        "916": [0, 0.68333, 0, 0.16667],
	        "920": [0, 0.68333, 0.02778, 0.08334],
	        "923": [0, 0.68333, 0, 0.16667],
	        "926": [0, 0.68333, 0.07569, 0.08334],
	        "928": [0, 0.68333, 0.08125, 0.05556],
	        "931": [0, 0.68333, 0.05764, 0.08334],
	        "933": [0, 0.68333, 0.13889, 0.05556],
	        "934": [0, 0.68333, 0, 0.08334],
	        "936": [0, 0.68333, 0.11, 0.05556],
	        "937": [0, 0.68333, 0.05017, 0.08334],
	        "945": [0, 0.43056, 0.0037, 0.02778],
	        "946": [0.19444, 0.69444, 0.05278, 0.08334],
	        "947": [0.19444, 0.43056, 0.05556, 0],
	        "948": [0, 0.69444, 0.03785, 0.05556],
	        "949": [0, 0.43056, 0, 0.08334],
	        "950": [0.19444, 0.69444, 0.07378, 0.08334],
	        "951": [0.19444, 0.43056, 0.03588, 0.05556],
	        "952": [0, 0.69444, 0.02778, 0.08334],
	        "953": [0, 0.43056, 0, 0.05556],
	        "954": [0, 0.43056, 0, 0],
	        "955": [0, 0.69444, 0, 0],
	        "956": [0.19444, 0.43056, 0, 0.02778],
	        "957": [0, 0.43056, 0.06366, 0.02778],
	        "958": [0.19444, 0.69444, 0.04601, 0.11111],
	        "959": [0, 0.43056, 0, 0.05556],
	        "960": [0, 0.43056, 0.03588, 0],
	        "961": [0.19444, 0.43056, 0, 0.08334],
	        "962": [0.09722, 0.43056, 0.07986, 0.08334],
	        "963": [0, 0.43056, 0.03588, 0],
	        "964": [0, 0.43056, 0.1132, 0.02778],
	        "965": [0, 0.43056, 0.03588, 0.02778],
	        "966": [0.19444, 0.43056, 0, 0.08334],
	        "967": [0.19444, 0.43056, 0, 0.05556],
	        "968": [0.19444, 0.69444, 0.03588, 0.11111],
	        "969": [0, 0.43056, 0.03588, 0],
	        "977": [0, 0.69444, 0, 0.08334],
	        "981": [0.19444, 0.69444, 0, 0.08334],
	        "982": [0, 0.43056, 0.02778, 0],
	        "1009": [0.19444, 0.43056, 0, 0.08334],
	        "1013": [0, 0.43056, 0, 0.05556],
	    },
	    "SansSerif-Regular": {
	        "33": [0, 0.69444, 0, 0],
	        "34": [0, 0.69444, 0, 0],
	        "35": [0.19444, 0.69444, 0, 0],
	        "36": [0.05556, 0.75, 0, 0],
	        "37": [0.05556, 0.75, 0, 0],
	        "38": [0, 0.69444, 0, 0],
	        "39": [0, 0.69444, 0, 0],
	        "40": [0.25, 0.75, 0, 0],
	        "41": [0.25, 0.75, 0, 0],
	        "42": [0, 0.75, 0, 0],
	        "43": [0.08333, 0.58333, 0, 0],
	        "44": [0.125, 0.08333, 0, 0],
	        "45": [0, 0.44444, 0, 0],
	        "46": [0, 0.08333, 0, 0],
	        "47": [0.25, 0.75, 0, 0],
	        "48": [0, 0.65556, 0, 0],
	        "49": [0, 0.65556, 0, 0],
	        "50": [0, 0.65556, 0, 0],
	        "51": [0, 0.65556, 0, 0],
	        "52": [0, 0.65556, 0, 0],
	        "53": [0, 0.65556, 0, 0],
	        "54": [0, 0.65556, 0, 0],
	        "55": [0, 0.65556, 0, 0],
	        "56": [0, 0.65556, 0, 0],
	        "57": [0, 0.65556, 0, 0],
	        "58": [0, 0.44444, 0, 0],
	        "59": [0.125, 0.44444, 0, 0],
	        "61": [-0.13, 0.37, 0, 0],
	        "63": [0, 0.69444, 0, 0],
	        "64": [0, 0.69444, 0, 0],
	        "65": [0, 0.69444, 0, 0],
	        "66": [0, 0.69444, 0, 0],
	        "67": [0, 0.69444, 0, 0],
	        "68": [0, 0.69444, 0, 0],
	        "69": [0, 0.69444, 0, 0],
	        "70": [0, 0.69444, 0, 0],
	        "71": [0, 0.69444, 0, 0],
	        "72": [0, 0.69444, 0, 0],
	        "73": [0, 0.69444, 0, 0],
	        "74": [0, 0.69444, 0, 0],
	        "75": [0, 0.69444, 0, 0],
	        "76": [0, 0.69444, 0, 0],
	        "77": [0, 0.69444, 0, 0],
	        "78": [0, 0.69444, 0, 0],
	        "79": [0, 0.69444, 0, 0],
	        "80": [0, 0.69444, 0, 0],
	        "81": [0.125, 0.69444, 0, 0],
	        "82": [0, 0.69444, 0, 0],
	        "83": [0, 0.69444, 0, 0],
	        "84": [0, 0.69444, 0, 0],
	        "85": [0, 0.69444, 0, 0],
	        "86": [0, 0.69444, 0.01389, 0],
	        "87": [0, 0.69444, 0.01389, 0],
	        "88": [0, 0.69444, 0, 0],
	        "89": [0, 0.69444, 0.025, 0],
	        "90": [0, 0.69444, 0, 0],
	        "91": [0.25, 0.75, 0, 0],
	        "93": [0.25, 0.75, 0, 0],
	        "94": [0, 0.69444, 0, 0],
	        "95": [0.35, 0.09444, 0.02778, 0],
	        "97": [0, 0.44444, 0, 0],
	        "98": [0, 0.69444, 0, 0],
	        "99": [0, 0.44444, 0, 0],
	        "100": [0, 0.69444, 0, 0],
	        "101": [0, 0.44444, 0, 0],
	        "102": [0, 0.69444, 0.06944, 0],
	        "103": [0.19444, 0.44444, 0.01389, 0],
	        "104": [0, 0.69444, 0, 0],
	        "105": [0, 0.67937, 0, 0],
	        "106": [0.19444, 0.67937, 0, 0],
	        "107": [0, 0.69444, 0, 0],
	        "108": [0, 0.69444, 0, 0],
	        "109": [0, 0.44444, 0, 0],
	        "110": [0, 0.44444, 0, 0],
	        "111": [0, 0.44444, 0, 0],
	        "112": [0.19444, 0.44444, 0, 0],
	        "113": [0.19444, 0.44444, 0, 0],
	        "114": [0, 0.44444, 0.01389, 0],
	        "115": [0, 0.44444, 0, 0],
	        "116": [0, 0.57143, 0, 0],
	        "117": [0, 0.44444, 0, 0],
	        "118": [0, 0.44444, 0.01389, 0],
	        "119": [0, 0.44444, 0.01389, 0],
	        "120": [0, 0.44444, 0, 0],
	        "121": [0.19444, 0.44444, 0.01389, 0],
	        "122": [0, 0.44444, 0, 0],
	        "126": [0.35, 0.32659, 0, 0],
	        "305": [0, 0.44444, 0, 0],
	        "567": [0.19444, 0.44444, 0, 0],
	        "768": [0, 0.69444, 0, 0],
	        "769": [0, 0.69444, 0, 0],
	        "770": [0, 0.69444, 0, 0],
	        "771": [0, 0.67659, 0, 0],
	        "772": [0, 0.60889, 0, 0],
	        "774": [0, 0.69444, 0, 0],
	        "775": [0, 0.67937, 0, 0],
	        "776": [0, 0.67937, 0, 0],
	        "778": [0, 0.69444, 0, 0],
	        "779": [0, 0.69444, 0, 0],
	        "780": [0, 0.63194, 0, 0],
	        "915": [0, 0.69444, 0, 0],
	        "916": [0, 0.69444, 0, 0],
	        "920": [0, 0.69444, 0, 0],
	        "923": [0, 0.69444, 0, 0],
	        "926": [0, 0.69444, 0, 0],
	        "928": [0, 0.69444, 0, 0],
	        "931": [0, 0.69444, 0, 0],
	        "933": [0, 0.69444, 0, 0],
	        "934": [0, 0.69444, 0, 0],
	        "936": [0, 0.69444, 0, 0],
	        "937": [0, 0.69444, 0, 0],
	        "8211": [0, 0.44444, 0.02778, 0],
	        "8212": [0, 0.44444, 0.02778, 0],
	        "8216": [0, 0.69444, 0, 0],
	        "8217": [0, 0.69444, 0, 0],
	        "8220": [0, 0.69444, 0, 0],
	        "8221": [0, 0.69444, 0, 0],
	    },
	    "Script-Regular": {
	        "65": [0, 0.7, 0.22925, 0],
	        "66": [0, 0.7, 0.04087, 0],
	        "67": [0, 0.7, 0.1689, 0],
	        "68": [0, 0.7, 0.09371, 0],
	        "69": [0, 0.7, 0.18583, 0],
	        "70": [0, 0.7, 0.13634, 0],
	        "71": [0, 0.7, 0.17322, 0],
	        "72": [0, 0.7, 0.29694, 0],
	        "73": [0, 0.7, 0.19189, 0],
	        "74": [0.27778, 0.7, 0.19189, 0],
	        "75": [0, 0.7, 0.31259, 0],
	        "76": [0, 0.7, 0.19189, 0],
	        "77": [0, 0.7, 0.15981, 0],
	        "78": [0, 0.7, 0.3525, 0],
	        "79": [0, 0.7, 0.08078, 0],
	        "80": [0, 0.7, 0.08078, 0],
	        "81": [0, 0.7, 0.03305, 0],
	        "82": [0, 0.7, 0.06259, 0],
	        "83": [0, 0.7, 0.19189, 0],
	        "84": [0, 0.7, 0.29087, 0],
	        "85": [0, 0.7, 0.25815, 0],
	        "86": [0, 0.7, 0.27523, 0],
	        "87": [0, 0.7, 0.27523, 0],
	        "88": [0, 0.7, 0.26006, 0],
	        "89": [0, 0.7, 0.2939, 0],
	        "90": [0, 0.7, 0.24037, 0],
	    },
	    "Size1-Regular": {
	        "40": [0.35001, 0.85, 0, 0],
	        "41": [0.35001, 0.85, 0, 0],
	        "47": [0.35001, 0.85, 0, 0],
	        "91": [0.35001, 0.85, 0, 0],
	        "92": [0.35001, 0.85, 0, 0],
	        "93": [0.35001, 0.85, 0, 0],
	        "123": [0.35001, 0.85, 0, 0],
	        "125": [0.35001, 0.85, 0, 0],
	        "710": [0, 0.72222, 0, 0],
	        "732": [0, 0.72222, 0, 0],
	        "770": [0, 0.72222, 0, 0],
	        "771": [0, 0.72222, 0, 0],
	        "8214": [-0.00099, 0.601, 0, 0],
	        "8593": [1e-05, 0.6, 0, 0],
	        "8595": [1e-05, 0.6, 0, 0],
	        "8657": [1e-05, 0.6, 0, 0],
	        "8659": [1e-05, 0.6, 0, 0],
	        "8719": [0.25001, 0.75, 0, 0],
	        "8720": [0.25001, 0.75, 0, 0],
	        "8721": [0.25001, 0.75, 0, 0],
	        "8730": [0.35001, 0.85, 0, 0],
	        "8739": [-0.00599, 0.606, 0, 0],
	        "8741": [-0.00599, 0.606, 0, 0],
	        "8747": [0.30612, 0.805, 0.19445, 0],
	        "8748": [0.306, 0.805, 0.19445, 0],
	        "8749": [0.306, 0.805, 0.19445, 0],
	        "8750": [0.30612, 0.805, 0.19445, 0],
	        "8896": [0.25001, 0.75, 0, 0],
	        "8897": [0.25001, 0.75, 0, 0],
	        "8898": [0.25001, 0.75, 0, 0],
	        "8899": [0.25001, 0.75, 0, 0],
	        "8968": [0.35001, 0.85, 0, 0],
	        "8969": [0.35001, 0.85, 0, 0],
	        "8970": [0.35001, 0.85, 0, 0],
	        "8971": [0.35001, 0.85, 0, 0],
	        "9168": [-0.00099, 0.601, 0, 0],
	        "10216": [0.35001, 0.85, 0, 0],
	        "10217": [0.35001, 0.85, 0, 0],
	        "10752": [0.25001, 0.75, 0, 0],
	        "10753": [0.25001, 0.75, 0, 0],
	        "10754": [0.25001, 0.75, 0, 0],
	        "10756": [0.25001, 0.75, 0, 0],
	        "10758": [0.25001, 0.75, 0, 0],
	    },
	    "Size2-Regular": {
	        "40": [0.65002, 1.15, 0, 0],
	        "41": [0.65002, 1.15, 0, 0],
	        "47": [0.65002, 1.15, 0, 0],
	        "91": [0.65002, 1.15, 0, 0],
	        "92": [0.65002, 1.15, 0, 0],
	        "93": [0.65002, 1.15, 0, 0],
	        "123": [0.65002, 1.15, 0, 0],
	        "125": [0.65002, 1.15, 0, 0],
	        "710": [0, 0.75, 0, 0],
	        "732": [0, 0.75, 0, 0],
	        "770": [0, 0.75, 0, 0],
	        "771": [0, 0.75, 0, 0],
	        "8719": [0.55001, 1.05, 0, 0],
	        "8720": [0.55001, 1.05, 0, 0],
	        "8721": [0.55001, 1.05, 0, 0],
	        "8730": [0.65002, 1.15, 0, 0],
	        "8747": [0.86225, 1.36, 0.44445, 0],
	        "8748": [0.862, 1.36, 0.44445, 0],
	        "8749": [0.862, 1.36, 0.44445, 0],
	        "8750": [0.86225, 1.36, 0.44445, 0],
	        "8896": [0.55001, 1.05, 0, 0],
	        "8897": [0.55001, 1.05, 0, 0],
	        "8898": [0.55001, 1.05, 0, 0],
	        "8899": [0.55001, 1.05, 0, 0],
	        "8968": [0.65002, 1.15, 0, 0],
	        "8969": [0.65002, 1.15, 0, 0],
	        "8970": [0.65002, 1.15, 0, 0],
	        "8971": [0.65002, 1.15, 0, 0],
	        "10216": [0.65002, 1.15, 0, 0],
	        "10217": [0.65002, 1.15, 0, 0],
	        "10752": [0.55001, 1.05, 0, 0],
	        "10753": [0.55001, 1.05, 0, 0],
	        "10754": [0.55001, 1.05, 0, 0],
	        "10756": [0.55001, 1.05, 0, 0],
	        "10758": [0.55001, 1.05, 0, 0],
	    },
	    "Size3-Regular": {
	        "40": [0.95003, 1.45, 0, 0],
	        "41": [0.95003, 1.45, 0, 0],
	        "47": [0.95003, 1.45, 0, 0],
	        "91": [0.95003, 1.45, 0, 0],
	        "92": [0.95003, 1.45, 0, 0],
	        "93": [0.95003, 1.45, 0, 0],
	        "123": [0.95003, 1.45, 0, 0],
	        "125": [0.95003, 1.45, 0, 0],
	        "710": [0, 0.75, 0, 0],
	        "732": [0, 0.75, 0, 0],
	        "770": [0, 0.75, 0, 0],
	        "771": [0, 0.75, 0, 0],
	        "8730": [0.95003, 1.45, 0, 0],
	        "8968": [0.95003, 1.45, 0, 0],
	        "8969": [0.95003, 1.45, 0, 0],
	        "8970": [0.95003, 1.45, 0, 0],
	        "8971": [0.95003, 1.45, 0, 0],
	        "10216": [0.95003, 1.45, 0, 0],
	        "10217": [0.95003, 1.45, 0, 0],
	    },
	    "Size4-Regular": {
	        "40": [1.25003, 1.75, 0, 0],
	        "41": [1.25003, 1.75, 0, 0],
	        "47": [1.25003, 1.75, 0, 0],
	        "91": [1.25003, 1.75, 0, 0],
	        "92": [1.25003, 1.75, 0, 0],
	        "93": [1.25003, 1.75, 0, 0],
	        "123": [1.25003, 1.75, 0, 0],
	        "125": [1.25003, 1.75, 0, 0],
	        "710": [0, 0.825, 0, 0],
	        "732": [0, 0.825, 0, 0],
	        "770": [0, 0.825, 0, 0],
	        "771": [0, 0.825, 0, 0],
	        "8730": [1.25003, 1.75, 0, 0],
	        "8968": [1.25003, 1.75, 0, 0],
	        "8969": [1.25003, 1.75, 0, 0],
	        "8970": [1.25003, 1.75, 0, 0],
	        "8971": [1.25003, 1.75, 0, 0],
	        "9115": [0.64502, 1.155, 0, 0],
	        "9116": [1e-05, 0.6, 0, 0],
	        "9117": [0.64502, 1.155, 0, 0],
	        "9118": [0.64502, 1.155, 0, 0],
	        "9119": [1e-05, 0.6, 0, 0],
	        "9120": [0.64502, 1.155, 0, 0],
	        "9121": [0.64502, 1.155, 0, 0],
	        "9122": [-0.00099, 0.601, 0, 0],
	        "9123": [0.64502, 1.155, 0, 0],
	        "9124": [0.64502, 1.155, 0, 0],
	        "9125": [-0.00099, 0.601, 0, 0],
	        "9126": [0.64502, 1.155, 0, 0],
	        "9127": [1e-05, 0.9, 0, 0],
	        "9128": [0.65002, 1.15, 0, 0],
	        "9129": [0.90001, 0, 0, 0],
	        "9130": [0, 0.3, 0, 0],
	        "9131": [1e-05, 0.9, 0, 0],
	        "9132": [0.65002, 1.15, 0, 0],
	        "9133": [0.90001, 0, 0, 0],
	        "9143": [0.88502, 0.915, 0, 0],
	        "10216": [1.25003, 1.75, 0, 0],
	        "10217": [1.25003, 1.75, 0, 0],
	        "57344": [-0.00499, 0.605, 0, 0],
	        "57345": [-0.00499, 0.605, 0, 0],
	        "57680": [0, 0.12, 0, 0],
	        "57681": [0, 0.12, 0, 0],
	        "57682": [0, 0.12, 0, 0],
	        "57683": [0, 0.12, 0, 0],
	    },
	    "Typewriter-Regular": {
	        "33": [0, 0.61111, 0, 0],
	        "34": [0, 0.61111, 0, 0],
	        "35": [0, 0.61111, 0, 0],
	        "36": [0.08333, 0.69444, 0, 0],
	        "37": [0.08333, 0.69444, 0, 0],
	        "38": [0, 0.61111, 0, 0],
	        "39": [0, 0.61111, 0, 0],
	        "40": [0.08333, 0.69444, 0, 0],
	        "41": [0.08333, 0.69444, 0, 0],
	        "42": [0, 0.52083, 0, 0],
	        "43": [-0.08056, 0.53055, 0, 0],
	        "44": [0.13889, 0.125, 0, 0],
	        "45": [-0.08056, 0.53055, 0, 0],
	        "46": [0, 0.125, 0, 0],
	        "47": [0.08333, 0.69444, 0, 0],
	        "48": [0, 0.61111, 0, 0],
	        "49": [0, 0.61111, 0, 0],
	        "50": [0, 0.61111, 0, 0],
	        "51": [0, 0.61111, 0, 0],
	        "52": [0, 0.61111, 0, 0],
	        "53": [0, 0.61111, 0, 0],
	        "54": [0, 0.61111, 0, 0],
	        "55": [0, 0.61111, 0, 0],
	        "56": [0, 0.61111, 0, 0],
	        "57": [0, 0.61111, 0, 0],
	        "58": [0, 0.43056, 0, 0],
	        "59": [0.13889, 0.43056, 0, 0],
	        "60": [-0.05556, 0.55556, 0, 0],
	        "61": [-0.19549, 0.41562, 0, 0],
	        "62": [-0.05556, 0.55556, 0, 0],
	        "63": [0, 0.61111, 0, 0],
	        "64": [0, 0.61111, 0, 0],
	        "65": [0, 0.61111, 0, 0],
	        "66": [0, 0.61111, 0, 0],
	        "67": [0, 0.61111, 0, 0],
	        "68": [0, 0.61111, 0, 0],
	        "69": [0, 0.61111, 0, 0],
	        "70": [0, 0.61111, 0, 0],
	        "71": [0, 0.61111, 0, 0],
	        "72": [0, 0.61111, 0, 0],
	        "73": [0, 0.61111, 0, 0],
	        "74": [0, 0.61111, 0, 0],
	        "75": [0, 0.61111, 0, 0],
	        "76": [0, 0.61111, 0, 0],
	        "77": [0, 0.61111, 0, 0],
	        "78": [0, 0.61111, 0, 0],
	        "79": [0, 0.61111, 0, 0],
	        "80": [0, 0.61111, 0, 0],
	        "81": [0.13889, 0.61111, 0, 0],
	        "82": [0, 0.61111, 0, 0],
	        "83": [0, 0.61111, 0, 0],
	        "84": [0, 0.61111, 0, 0],
	        "85": [0, 0.61111, 0, 0],
	        "86": [0, 0.61111, 0, 0],
	        "87": [0, 0.61111, 0, 0],
	        "88": [0, 0.61111, 0, 0],
	        "89": [0, 0.61111, 0, 0],
	        "90": [0, 0.61111, 0, 0],
	        "91": [0.08333, 0.69444, 0, 0],
	        "92": [0.08333, 0.69444, 0, 0],
	        "93": [0.08333, 0.69444, 0, 0],
	        "94": [0, 0.61111, 0, 0],
	        "95": [0.09514, 0, 0, 0],
	        "96": [0, 0.61111, 0, 0],
	        "97": [0, 0.43056, 0, 0],
	        "98": [0, 0.61111, 0, 0],
	        "99": [0, 0.43056, 0, 0],
	        "100": [0, 0.61111, 0, 0],
	        "101": [0, 0.43056, 0, 0],
	        "102": [0, 0.61111, 0, 0],
	        "103": [0.22222, 0.43056, 0, 0],
	        "104": [0, 0.61111, 0, 0],
	        "105": [0, 0.61111, 0, 0],
	        "106": [0.22222, 0.61111, 0, 0],
	        "107": [0, 0.61111, 0, 0],
	        "108": [0, 0.61111, 0, 0],
	        "109": [0, 0.43056, 0, 0],
	        "110": [0, 0.43056, 0, 0],
	        "111": [0, 0.43056, 0, 0],
	        "112": [0.22222, 0.43056, 0, 0],
	        "113": [0.22222, 0.43056, 0, 0],
	        "114": [0, 0.43056, 0, 0],
	        "115": [0, 0.43056, 0, 0],
	        "116": [0, 0.55358, 0, 0],
	        "117": [0, 0.43056, 0, 0],
	        "118": [0, 0.43056, 0, 0],
	        "119": [0, 0.43056, 0, 0],
	        "120": [0, 0.43056, 0, 0],
	        "121": [0.22222, 0.43056, 0, 0],
	        "122": [0, 0.43056, 0, 0],
	        "123": [0.08333, 0.69444, 0, 0],
	        "124": [0.08333, 0.69444, 0, 0],
	        "125": [0.08333, 0.69444, 0, 0],
	        "126": [0, 0.61111, 0, 0],
	        "127": [0, 0.61111, 0, 0],
	        "305": [0, 0.43056, 0, 0],
	        "567": [0.22222, 0.43056, 0, 0],
	        "768": [0, 0.61111, 0, 0],
	        "769": [0, 0.61111, 0, 0],
	        "770": [0, 0.61111, 0, 0],
	        "771": [0, 0.61111, 0, 0],
	        "772": [0, 0.56555, 0, 0],
	        "774": [0, 0.61111, 0, 0],
	        "776": [0, 0.61111, 0, 0],
	        "778": [0, 0.61111, 0, 0],
	        "780": [0, 0.56597, 0, 0],
	        "915": [0, 0.61111, 0, 0],
	        "916": [0, 0.61111, 0, 0],
	        "920": [0, 0.61111, 0, 0],
	        "923": [0, 0.61111, 0, 0],
	        "926": [0, 0.61111, 0, 0],
	        "928": [0, 0.61111, 0, 0],
	        "931": [0, 0.61111, 0, 0],
	        "933": [0, 0.61111, 0, 0],
	        "934": [0, 0.61111, 0, 0],
	        "936": [0, 0.61111, 0, 0],
	        "937": [0, 0.61111, 0, 0],
	        "2018": [0, 0.61111, 0, 0],
	        "2019": [0, 0.61111, 0, 0],
	        "8242": [0, 0.61111, 0, 0],
	    },
	};


/***/ },
/* 82 */
/***/ function(module, exports) {

	/**
	 * This file holds a list of all no-argument functions and single-character
	 * symbols (like 'a' or ';').
	 *
	 * For each of the symbols, there are three properties they can have:
	 * - font (required): the font to be used for this symbol. Either "main" (the
	     normal font), or "ams" (the ams fonts).
	 * - group (required): the ParseNode group type the symbol should have (i.e.
	     "textord", "mathord", etc).
	     See https://github.com/Khan/KaTeX/wiki/Examining-TeX#group-types
	 * - replace: the character that this symbol or function should be
	 *   replaced with (i.e. "\phi" has a replace value of "\u03d5", the phi
	 *   character in the main font).
	 *
	 * The outermost map in the table indicates what mode the symbols should be
	 * accepted in (e.g. "math" or "text").
	 */

	module.exports = {
	    math: {},
	    text: {},
	};

	function defineSymbol(mode, font, group, replace, name) {
	    module.exports[mode][name] = {
	        font: font,
	        group: group,
	        replace: replace,
	    };
	}

	// Some abbreviations for commonly used strings.
	// This helps minify the code, and also spotting typos using jshint.

	// modes:
	var math = "math";
	var text = "text";

	// fonts:
	var main = "main";
	var ams = "ams";

	// groups:
	var accent = "accent";
	var bin = "bin";
	var close = "close";
	var inner = "inner";
	var mathord = "mathord";
	var op = "op";
	var open = "open";
	var punct = "punct";
	var rel = "rel";
	var spacing = "spacing";
	var textord = "textord";

	// Now comes the symbol table

	// Relation Symbols
	defineSymbol(math, main, rel, "\u2261", "\\equiv");
	defineSymbol(math, main, rel, "\u227a", "\\prec");
	defineSymbol(math, main, rel, "\u227b", "\\succ");
	defineSymbol(math, main, rel, "\u223c", "\\sim");
	defineSymbol(math, main, rel, "\u22a5", "\\perp");
	defineSymbol(math, main, rel, "\u2aaf", "\\preceq");
	defineSymbol(math, main, rel, "\u2ab0", "\\succeq");
	defineSymbol(math, main, rel, "\u2243", "\\simeq");
	defineSymbol(math, main, rel, "\u2223", "\\mid");
	defineSymbol(math, main, rel, "\u226a", "\\ll");
	defineSymbol(math, main, rel, "\u226b", "\\gg");
	defineSymbol(math, main, rel, "\u224d", "\\asymp");
	defineSymbol(math, main, rel, "\u2225", "\\parallel");
	defineSymbol(math, main, rel, "\u22c8", "\\bowtie");
	defineSymbol(math, main, rel, "\u2323", "\\smile");
	defineSymbol(math, main, rel, "\u2291", "\\sqsubseteq");
	defineSymbol(math, main, rel, "\u2292", "\\sqsupseteq");
	defineSymbol(math, main, rel, "\u2250", "\\doteq");
	defineSymbol(math, main, rel, "\u2322", "\\frown");
	defineSymbol(math, main, rel, "\u220b", "\\ni");
	defineSymbol(math, main, rel, "\u221d", "\\propto");
	defineSymbol(math, main, rel, "\u22a2", "\\vdash");
	defineSymbol(math, main, rel, "\u22a3", "\\dashv");
	defineSymbol(math, main, rel, "\u220b", "\\owns");

	// Punctuation
	defineSymbol(math, main, punct, "\u002e", "\\ldotp");
	defineSymbol(math, main, punct, "\u22c5", "\\cdotp");

	// Misc Symbols
	defineSymbol(math, main, textord, "\u0023", "\\#");
	defineSymbol(math, main, textord, "\u0026", "\\&");
	defineSymbol(math, main, textord, "\u2135", "\\aleph");
	defineSymbol(math, main, textord, "\u2200", "\\forall");
	defineSymbol(math, main, textord, "\u210f", "\\hbar");
	defineSymbol(math, main, textord, "\u2203", "\\exists");
	defineSymbol(math, main, textord, "\u2207", "\\nabla");
	defineSymbol(math, main, textord, "\u266d", "\\flat");
	defineSymbol(math, main, textord, "\u2113", "\\ell");
	defineSymbol(math, main, textord, "\u266e", "\\natural");
	defineSymbol(math, main, textord, "\u2663", "\\clubsuit");
	defineSymbol(math, main, textord, "\u2118", "\\wp");
	defineSymbol(math, main, textord, "\u266f", "\\sharp");
	defineSymbol(math, main, textord, "\u2662", "\\diamondsuit");
	defineSymbol(math, main, textord, "\u211c", "\\Re");
	defineSymbol(math, main, textord, "\u2661", "\\heartsuit");
	defineSymbol(math, main, textord, "\u2111", "\\Im");
	defineSymbol(math, main, textord, "\u2660", "\\spadesuit");

	// Math and Text
	defineSymbol(math, main, textord, "\u2020", "\\dag");
	defineSymbol(math, main, textord, "\u2021", "\\ddag");

	// Large Delimiters
	defineSymbol(math, main, close, "\u23b1", "\\rmoustache");
	defineSymbol(math, main, open, "\u23b0", "\\lmoustache");
	defineSymbol(math, main, close, "\u27ef", "\\rgroup");
	defineSymbol(math, main, open, "\u27ee", "\\lgroup");

	// Binary Operators
	defineSymbol(math, main, bin, "\u2213", "\\mp");
	defineSymbol(math, main, bin, "\u2296", "\\ominus");
	defineSymbol(math, main, bin, "\u228e", "\\uplus");
	defineSymbol(math, main, bin, "\u2293", "\\sqcap");
	defineSymbol(math, main, bin, "\u2217", "\\ast");
	defineSymbol(math, main, bin, "\u2294", "\\sqcup");
	defineSymbol(math, main, bin, "\u25ef", "\\bigcirc");
	defineSymbol(math, main, bin, "\u2219", "\\bullet");
	defineSymbol(math, main, bin, "\u2021", "\\ddagger");
	defineSymbol(math, main, bin, "\u2240", "\\wr");
	defineSymbol(math, main, bin, "\u2a3f", "\\amalg");

	// Arrow Symbols
	defineSymbol(math, main, rel, "\u27f5", "\\longleftarrow");
	defineSymbol(math, main, rel, "\u21d0", "\\Leftarrow");
	defineSymbol(math, main, rel, "\u27f8", "\\Longleftarrow");
	defineSymbol(math, main, rel, "\u27f6", "\\longrightarrow");
	defineSymbol(math, main, rel, "\u21d2", "\\Rightarrow");
	defineSymbol(math, main, rel, "\u27f9", "\\Longrightarrow");
	defineSymbol(math, main, rel, "\u2194", "\\leftrightarrow");
	defineSymbol(math, main, rel, "\u27f7", "\\longleftrightarrow");
	defineSymbol(math, main, rel, "\u21d4", "\\Leftrightarrow");
	defineSymbol(math, main, rel, "\u27fa", "\\Longleftrightarrow");
	defineSymbol(math, main, rel, "\u21a6", "\\mapsto");
	defineSymbol(math, main, rel, "\u27fc", "\\longmapsto");
	defineSymbol(math, main, rel, "\u2197", "\\nearrow");
	defineSymbol(math, main, rel, "\u21a9", "\\hookleftarrow");
	defineSymbol(math, main, rel, "\u21aa", "\\hookrightarrow");
	defineSymbol(math, main, rel, "\u2198", "\\searrow");
	defineSymbol(math, main, rel, "\u21bc", "\\leftharpoonup");
	defineSymbol(math, main, rel, "\u21c0", "\\rightharpoonup");
	defineSymbol(math, main, rel, "\u2199", "\\swarrow");
	defineSymbol(math, main, rel, "\u21bd", "\\leftharpoondown");
	defineSymbol(math, main, rel, "\u21c1", "\\rightharpoondown");
	defineSymbol(math, main, rel, "\u2196", "\\nwarrow");
	defineSymbol(math, main, rel, "\u21cc", "\\rightleftharpoons");

	// AMS Negated Binary Relations
	defineSymbol(math, ams, rel, "\u226e", "\\nless");
	defineSymbol(math, ams, rel, "\ue010", "\\nleqslant");
	defineSymbol(math, ams, rel, "\ue011", "\\nleqq");
	defineSymbol(math, ams, rel, "\u2a87", "\\lneq");
	defineSymbol(math, ams, rel, "\u2268", "\\lneqq");
	defineSymbol(math, ams, rel, "\ue00c", "\\lvertneqq");
	defineSymbol(math, ams, rel, "\u22e6", "\\lnsim");
	defineSymbol(math, ams, rel, "\u2a89", "\\lnapprox");
	defineSymbol(math, ams, rel, "\u2280", "\\nprec");
	defineSymbol(math, ams, rel, "\u22e0", "\\npreceq");
	defineSymbol(math, ams, rel, "\u22e8", "\\precnsim");
	defineSymbol(math, ams, rel, "\u2ab9", "\\precnapprox");
	defineSymbol(math, ams, rel, "\u2241", "\\nsim");
	defineSymbol(math, ams, rel, "\ue006", "\\nshortmid");
	defineSymbol(math, ams, rel, "\u2224", "\\nmid");
	defineSymbol(math, ams, rel, "\u22ac", "\\nvdash");
	defineSymbol(math, ams, rel, "\u22ad", "\\nvDash");
	defineSymbol(math, ams, rel, "\u22ea", "\\ntriangleleft");
	defineSymbol(math, ams, rel, "\u22ec", "\\ntrianglelefteq");
	defineSymbol(math, ams, rel, "\u228a", "\\subsetneq");
	defineSymbol(math, ams, rel, "\ue01a", "\\varsubsetneq");
	defineSymbol(math, ams, rel, "\u2acb", "\\subsetneqq");
	defineSymbol(math, ams, rel, "\ue017", "\\varsubsetneqq");
	defineSymbol(math, ams, rel, "\u226f", "\\ngtr");
	defineSymbol(math, ams, rel, "\ue00f", "\\ngeqslant");
	defineSymbol(math, ams, rel, "\ue00e", "\\ngeqq");
	defineSymbol(math, ams, rel, "\u2a88", "\\gneq");
	defineSymbol(math, ams, rel, "\u2269", "\\gneqq");
	defineSymbol(math, ams, rel, "\ue00d", "\\gvertneqq");
	defineSymbol(math, ams, rel, "\u22e7", "\\gnsim");
	defineSymbol(math, ams, rel, "\u2a8a", "\\gnapprox");
	defineSymbol(math, ams, rel, "\u2281", "\\nsucc");
	defineSymbol(math, ams, rel, "\u22e1", "\\nsucceq");
	defineSymbol(math, ams, rel, "\u22e9", "\\succnsim");
	defineSymbol(math, ams, rel, "\u2aba", "\\succnapprox");
	defineSymbol(math, ams, rel, "\u2246", "\\ncong");
	defineSymbol(math, ams, rel, "\ue007", "\\nshortparallel");
	defineSymbol(math, ams, rel, "\u2226", "\\nparallel");
	defineSymbol(math, ams, rel, "\u22af", "\\nVDash");
	defineSymbol(math, ams, rel, "\u22eb", "\\ntriangleright");
	defineSymbol(math, ams, rel, "\u22ed", "\\ntrianglerighteq");
	defineSymbol(math, ams, rel, "\ue018", "\\nsupseteqq");
	defineSymbol(math, ams, rel, "\u228b", "\\supsetneq");
	defineSymbol(math, ams, rel, "\ue01b", "\\varsupsetneq");
	defineSymbol(math, ams, rel, "\u2acc", "\\supsetneqq");
	defineSymbol(math, ams, rel, "\ue019", "\\varsupsetneqq");
	defineSymbol(math, ams, rel, "\u22ae", "\\nVdash");
	defineSymbol(math, ams, rel, "\u2ab5", "\\precneqq");
	defineSymbol(math, ams, rel, "\u2ab6", "\\succneqq");
	defineSymbol(math, ams, rel, "\ue016", "\\nsubseteqq");
	defineSymbol(math, ams, bin, "\u22b4", "\\unlhd");
	defineSymbol(math, ams, bin, "\u22b5", "\\unrhd");

	// AMS Negated Arrows
	defineSymbol(math, ams, rel, "\u219a", "\\nleftarrow");
	defineSymbol(math, ams, rel, "\u219b", "\\nrightarrow");
	defineSymbol(math, ams, rel, "\u21cd", "\\nLeftarrow");
	defineSymbol(math, ams, rel, "\u21cf", "\\nRightarrow");
	defineSymbol(math, ams, rel, "\u21ae", "\\nleftrightarrow");
	defineSymbol(math, ams, rel, "\u21ce", "\\nLeftrightarrow");

	// AMS Misc
	defineSymbol(math, ams, rel, "\u25b3", "\\vartriangle");
	defineSymbol(math, ams, textord, "\u210f", "\\hslash");
	defineSymbol(math, ams, textord, "\u25bd", "\\triangledown");
	defineSymbol(math, ams, textord, "\u25ca", "\\lozenge");
	defineSymbol(math, ams, textord, "\u24c8", "\\circledS");
	defineSymbol(math, ams, textord, "\u00ae", "\\circledR");
	defineSymbol(math, ams, textord, "\u2221", "\\measuredangle");
	defineSymbol(math, ams, textord, "\u2204", "\\nexists");
	defineSymbol(math, ams, textord, "\u2127", "\\mho");
	defineSymbol(math, ams, textord, "\u2132", "\\Finv");
	defineSymbol(math, ams, textord, "\u2141", "\\Game");
	defineSymbol(math, ams, textord, "\u006b", "\\Bbbk");
	defineSymbol(math, ams, textord, "\u2035", "\\backprime");
	defineSymbol(math, ams, textord, "\u25b2", "\\blacktriangle");
	defineSymbol(math, ams, textord, "\u25bc", "\\blacktriangledown");
	defineSymbol(math, ams, textord, "\u25a0", "\\blacksquare");
	defineSymbol(math, ams, textord, "\u29eb", "\\blacklozenge");
	defineSymbol(math, ams, textord, "\u2605", "\\bigstar");
	defineSymbol(math, ams, textord, "\u2222", "\\sphericalangle");
	defineSymbol(math, ams, textord, "\u2201", "\\complement");
	defineSymbol(math, ams, textord, "\u00f0", "\\eth");
	defineSymbol(math, ams, textord, "\u2571", "\\diagup");
	defineSymbol(math, ams, textord, "\u2572", "\\diagdown");
	defineSymbol(math, ams, textord, "\u25a1", "\\square");
	defineSymbol(math, ams, textord, "\u25a1", "\\Box");
	defineSymbol(math, ams, textord, "\u25ca", "\\Diamond");
	defineSymbol(math, ams, textord, "\u00a5", "\\yen");
	defineSymbol(math, ams, textord, "\u2713", "\\checkmark");

	// AMS Hebrew
	defineSymbol(math, ams, textord, "\u2136", "\\beth");
	defineSymbol(math, ams, textord, "\u2138", "\\daleth");
	defineSymbol(math, ams, textord, "\u2137", "\\gimel");

	// AMS Greek
	defineSymbol(math, ams, textord, "\u03dd", "\\digamma");
	defineSymbol(math, ams, textord, "\u03f0", "\\varkappa");

	// AMS Delimiters
	defineSymbol(math, ams, open, "\u250c", "\\ulcorner");
	defineSymbol(math, ams, close, "\u2510", "\\urcorner");
	defineSymbol(math, ams, open, "\u2514", "\\llcorner");
	defineSymbol(math, ams, close, "\u2518", "\\lrcorner");

	// AMS Binary Relations
	defineSymbol(math, ams, rel, "\u2266", "\\leqq");
	defineSymbol(math, ams, rel, "\u2a7d", "\\leqslant");
	defineSymbol(math, ams, rel, "\u2a95", "\\eqslantless");
	defineSymbol(math, ams, rel, "\u2272", "\\lesssim");
	defineSymbol(math, ams, rel, "\u2a85", "\\lessapprox");
	defineSymbol(math, ams, rel, "\u224a", "\\approxeq");
	defineSymbol(math, ams, bin, "\u22d6", "\\lessdot");
	defineSymbol(math, ams, rel, "\u22d8", "\\lll");
	defineSymbol(math, ams, rel, "\u2276", "\\lessgtr");
	defineSymbol(math, ams, rel, "\u22da", "\\lesseqgtr");
	defineSymbol(math, ams, rel, "\u2a8b", "\\lesseqqgtr");
	defineSymbol(math, ams, rel, "\u2251", "\\doteqdot");
	defineSymbol(math, ams, rel, "\u2253", "\\risingdotseq");
	defineSymbol(math, ams, rel, "\u2252", "\\fallingdotseq");
	defineSymbol(math, ams, rel, "\u223d", "\\backsim");
	defineSymbol(math, ams, rel, "\u22cd", "\\backsimeq");
	defineSymbol(math, ams, rel, "\u2ac5", "\\subseteqq");
	defineSymbol(math, ams, rel, "\u22d0", "\\Subset");
	defineSymbol(math, ams, rel, "\u228f", "\\sqsubset");
	defineSymbol(math, ams, rel, "\u227c", "\\preccurlyeq");
	defineSymbol(math, ams, rel, "\u22de", "\\curlyeqprec");
	defineSymbol(math, ams, rel, "\u227e", "\\precsim");
	defineSymbol(math, ams, rel, "\u2ab7", "\\precapprox");
	defineSymbol(math, ams, rel, "\u22b2", "\\vartriangleleft");
	defineSymbol(math, ams, rel, "\u22b4", "\\trianglelefteq");
	defineSymbol(math, ams, rel, "\u22a8", "\\vDash");
	defineSymbol(math, ams, rel, "\u22aa", "\\Vvdash");
	defineSymbol(math, ams, rel, "\u2323", "\\smallsmile");
	defineSymbol(math, ams, rel, "\u2322", "\\smallfrown");
	defineSymbol(math, ams, rel, "\u224f", "\\bumpeq");
	defineSymbol(math, ams, rel, "\u224e", "\\Bumpeq");
	defineSymbol(math, ams, rel, "\u2267", "\\geqq");
	defineSymbol(math, ams, rel, "\u2a7e", "\\geqslant");
	defineSymbol(math, ams, rel, "\u2a96", "\\eqslantgtr");
	defineSymbol(math, ams, rel, "\u2273", "\\gtrsim");
	defineSymbol(math, ams, rel, "\u2a86", "\\gtrapprox");
	defineSymbol(math, ams, bin, "\u22d7", "\\gtrdot");
	defineSymbol(math, ams, rel, "\u22d9", "\\ggg");
	defineSymbol(math, ams, rel, "\u2277", "\\gtrless");
	defineSymbol(math, ams, rel, "\u22db", "\\gtreqless");
	defineSymbol(math, ams, rel, "\u2a8c", "\\gtreqqless");
	defineSymbol(math, ams, rel, "\u2256", "\\eqcirc");
	defineSymbol(math, ams, rel, "\u2257", "\\circeq");
	defineSymbol(math, ams, rel, "\u225c", "\\triangleq");
	defineSymbol(math, ams, rel, "\u223c", "\\thicksim");
	defineSymbol(math, ams, rel, "\u2248", "\\thickapprox");
	defineSymbol(math, ams, rel, "\u2ac6", "\\supseteqq");
	defineSymbol(math, ams, rel, "\u22d1", "\\Supset");
	defineSymbol(math, ams, rel, "\u2290", "\\sqsupset");
	defineSymbol(math, ams, rel, "\u227d", "\\succcurlyeq");
	defineSymbol(math, ams, rel, "\u22df", "\\curlyeqsucc");
	defineSymbol(math, ams, rel, "\u227f", "\\succsim");
	defineSymbol(math, ams, rel, "\u2ab8", "\\succapprox");
	defineSymbol(math, ams, rel, "\u22b3", "\\vartriangleright");
	defineSymbol(math, ams, rel, "\u22b5", "\\trianglerighteq");
	defineSymbol(math, ams, rel, "\u22a9", "\\Vdash");
	defineSymbol(math, ams, rel, "\u2223", "\\shortmid");
	defineSymbol(math, ams, rel, "\u2225", "\\shortparallel");
	defineSymbol(math, ams, rel, "\u226c", "\\between");
	defineSymbol(math, ams, rel, "\u22d4", "\\pitchfork");
	defineSymbol(math, ams, rel, "\u221d", "\\varpropto");
	defineSymbol(math, ams, rel, "\u25c0", "\\blacktriangleleft");
	defineSymbol(math, ams, rel, "\u2234", "\\therefore");
	defineSymbol(math, ams, rel, "\u220d", "\\backepsilon");
	defineSymbol(math, ams, rel, "\u25b6", "\\blacktriangleright");
	defineSymbol(math, ams, rel, "\u2235", "\\because");
	defineSymbol(math, ams, rel, "\u22d8", "\\llless");
	defineSymbol(math, ams, rel, "\u22d9", "\\gggtr");
	defineSymbol(math, ams, bin, "\u22b2", "\\lhd");
	defineSymbol(math, ams, bin, "\u22b3", "\\rhd");
	defineSymbol(math, ams, rel, "\u2242", "\\eqsim");
	defineSymbol(math, main, rel, "\u22c8", "\\Join");
	defineSymbol(math, ams, rel, "\u2251", "\\Doteq");

	// AMS Binary Operators
	defineSymbol(math, ams, bin, "\u2214", "\\dotplus");
	defineSymbol(math, ams, bin, "\u2216", "\\smallsetminus");
	defineSymbol(math, ams, bin, "\u22d2", "\\Cap");
	defineSymbol(math, ams, bin, "\u22d3", "\\Cup");
	defineSymbol(math, ams, bin, "\u2a5e", "\\doublebarwedge");
	defineSymbol(math, ams, bin, "\u229f", "\\boxminus");
	defineSymbol(math, ams, bin, "\u229e", "\\boxplus");
	defineSymbol(math, ams, bin, "\u22c7", "\\divideontimes");
	defineSymbol(math, ams, bin, "\u22c9", "\\ltimes");
	defineSymbol(math, ams, bin, "\u22ca", "\\rtimes");
	defineSymbol(math, ams, bin, "\u22cb", "\\leftthreetimes");
	defineSymbol(math, ams, bin, "\u22cc", "\\rightthreetimes");
	defineSymbol(math, ams, bin, "\u22cf", "\\curlywedge");
	defineSymbol(math, ams, bin, "\u22ce", "\\curlyvee");
	defineSymbol(math, ams, bin, "\u229d", "\\circleddash");
	defineSymbol(math, ams, bin, "\u229b", "\\circledast");
	defineSymbol(math, ams, bin, "\u22c5", "\\centerdot");
	defineSymbol(math, ams, bin, "\u22ba", "\\intercal");
	defineSymbol(math, ams, bin, "\u22d2", "\\doublecap");
	defineSymbol(math, ams, bin, "\u22d3", "\\doublecup");
	defineSymbol(math, ams, bin, "\u22a0", "\\boxtimes");

	// AMS Arrows
	defineSymbol(math, ams, rel, "\u21e2", "\\dashrightarrow");
	defineSymbol(math, ams, rel, "\u21e0", "\\dashleftarrow");
	defineSymbol(math, ams, rel, "\u21c7", "\\leftleftarrows");
	defineSymbol(math, ams, rel, "\u21c6", "\\leftrightarrows");
	defineSymbol(math, ams, rel, "\u21da", "\\Lleftarrow");
	defineSymbol(math, ams, rel, "\u219e", "\\twoheadleftarrow");
	defineSymbol(math, ams, rel, "\u21a2", "\\leftarrowtail");
	defineSymbol(math, ams, rel, "\u21ab", "\\looparrowleft");
	defineSymbol(math, ams, rel, "\u21cb", "\\leftrightharpoons");
	defineSymbol(math, ams, rel, "\u21b6", "\\curvearrowleft");
	defineSymbol(math, ams, rel, "\u21ba", "\\circlearrowleft");
	defineSymbol(math, ams, rel, "\u21b0", "\\Lsh");
	defineSymbol(math, ams, rel, "\u21c8", "\\upuparrows");
	defineSymbol(math, ams, rel, "\u21bf", "\\upharpoonleft");
	defineSymbol(math, ams, rel, "\u21c3", "\\downharpoonleft");
	defineSymbol(math, ams, rel, "\u22b8", "\\multimap");
	defineSymbol(math, ams, rel, "\u21ad", "\\leftrightsquigarrow");
	defineSymbol(math, ams, rel, "\u21c9", "\\rightrightarrows");
	defineSymbol(math, ams, rel, "\u21c4", "\\rightleftarrows");
	defineSymbol(math, ams, rel, "\u21a0", "\\twoheadrightarrow");
	defineSymbol(math, ams, rel, "\u21a3", "\\rightarrowtail");
	defineSymbol(math, ams, rel, "\u21ac", "\\looparrowright");
	defineSymbol(math, ams, rel, "\u21b7", "\\curvearrowright");
	defineSymbol(math, ams, rel, "\u21bb", "\\circlearrowright");
	defineSymbol(math, ams, rel, "\u21b1", "\\Rsh");
	defineSymbol(math, ams, rel, "\u21ca", "\\downdownarrows");
	defineSymbol(math, ams, rel, "\u21be", "\\upharpoonright");
	defineSymbol(math, ams, rel, "\u21c2", "\\downharpoonright");
	defineSymbol(math, ams, rel, "\u21dd", "\\rightsquigarrow");
	defineSymbol(math, ams, rel, "\u21dd", "\\leadsto");
	defineSymbol(math, ams, rel, "\u21db", "\\Rrightarrow");
	defineSymbol(math, ams, rel, "\u21be", "\\restriction");

	defineSymbol(math, main, textord, "\u2018", "`");
	defineSymbol(math, main, textord, "$", "\\$");
	defineSymbol(math, main, textord, "%", "\\%");
	defineSymbol(math, main, textord, "_", "\\_");
	defineSymbol(math, main, textord, "\u2220", "\\angle");
	defineSymbol(math, main, textord, "\u221e", "\\infty");
	defineSymbol(math, main, textord, "\u2032", "\\prime");
	defineSymbol(math, main, textord, "\u25b3", "\\triangle");
	defineSymbol(math, main, textord, "\u0393", "\\Gamma");
	defineSymbol(math, main, textord, "\u0394", "\\Delta");
	defineSymbol(math, main, textord, "\u0398", "\\Theta");
	defineSymbol(math, main, textord, "\u039b", "\\Lambda");
	defineSymbol(math, main, textord, "\u039e", "\\Xi");
	defineSymbol(math, main, textord, "\u03a0", "\\Pi");
	defineSymbol(math, main, textord, "\u03a3", "\\Sigma");
	defineSymbol(math, main, textord, "\u03a5", "\\Upsilon");
	defineSymbol(math, main, textord, "\u03a6", "\\Phi");
	defineSymbol(math, main, textord, "\u03a8", "\\Psi");
	defineSymbol(math, main, textord, "\u03a9", "\\Omega");
	defineSymbol(math, main, textord, "\u00ac", "\\neg");
	defineSymbol(math, main, textord, "\u00ac", "\\lnot");
	defineSymbol(math, main, textord, "\u22a4", "\\top");
	defineSymbol(math, main, textord, "\u22a5", "\\bot");
	defineSymbol(math, main, textord, "\u2205", "\\emptyset");
	defineSymbol(math, ams, textord, "\u2205", "\\varnothing");
	defineSymbol(math, main, mathord, "\u03b1", "\\alpha");
	defineSymbol(math, main, mathord, "\u03b2", "\\beta");
	defineSymbol(math, main, mathord, "\u03b3", "\\gamma");
	defineSymbol(math, main, mathord, "\u03b4", "\\delta");
	defineSymbol(math, main, mathord, "\u03f5", "\\epsilon");
	defineSymbol(math, main, mathord, "\u03b6", "\\zeta");
	defineSymbol(math, main, mathord, "\u03b7", "\\eta");
	defineSymbol(math, main, mathord, "\u03b8", "\\theta");
	defineSymbol(math, main, mathord, "\u03b9", "\\iota");
	defineSymbol(math, main, mathord, "\u03ba", "\\kappa");
	defineSymbol(math, main, mathord, "\u03bb", "\\lambda");
	defineSymbol(math, main, mathord, "\u03bc", "\\mu");
	defineSymbol(math, main, mathord, "\u03bd", "\\nu");
	defineSymbol(math, main, mathord, "\u03be", "\\xi");
	defineSymbol(math, main, mathord, "o", "\\omicron");
	defineSymbol(math, main, mathord, "\u03c0", "\\pi");
	defineSymbol(math, main, mathord, "\u03c1", "\\rho");
	defineSymbol(math, main, mathord, "\u03c3", "\\sigma");
	defineSymbol(math, main, mathord, "\u03c4", "\\tau");
	defineSymbol(math, main, mathord, "\u03c5", "\\upsilon");
	defineSymbol(math, main, mathord, "\u03d5", "\\phi");
	defineSymbol(math, main, mathord, "\u03c7", "\\chi");
	defineSymbol(math, main, mathord, "\u03c8", "\\psi");
	defineSymbol(math, main, mathord, "\u03c9", "\\omega");
	defineSymbol(math, main, mathord, "\u03b5", "\\varepsilon");
	defineSymbol(math, main, mathord, "\u03d1", "\\vartheta");
	defineSymbol(math, main, mathord, "\u03d6", "\\varpi");
	defineSymbol(math, main, mathord, "\u03f1", "\\varrho");
	defineSymbol(math, main, mathord, "\u03c2", "\\varsigma");
	defineSymbol(math, main, mathord, "\u03c6", "\\varphi");
	defineSymbol(math, main, bin, "\u2217", "*");
	defineSymbol(math, main, bin, "+", "+");
	defineSymbol(math, main, bin, "\u2212", "-");
	defineSymbol(math, main, bin, "\u22c5", "\\cdot");
	defineSymbol(math, main, bin, "\u2218", "\\circ");
	defineSymbol(math, main, bin, "\u00f7", "\\div");
	defineSymbol(math, main, bin, "\u00b1", "\\pm");
	defineSymbol(math, main, bin, "\u00d7", "\\times");
	defineSymbol(math, main, bin, "\u2229", "\\cap");
	defineSymbol(math, main, bin, "\u222a", "\\cup");
	defineSymbol(math, main, bin, "\u2216", "\\setminus");
	defineSymbol(math, main, bin, "\u2227", "\\land");
	defineSymbol(math, main, bin, "\u2228", "\\lor");
	defineSymbol(math, main, bin, "\u2227", "\\wedge");
	defineSymbol(math, main, bin, "\u2228", "\\vee");
	defineSymbol(math, main, textord, "\u221a", "\\surd");
	defineSymbol(math, main, open, "(", "(");
	defineSymbol(math, main, open, "[", "[");
	defineSymbol(math, main, open, "\u27e8", "\\langle");
	defineSymbol(math, main, open, "\u2223", "\\lvert");
	defineSymbol(math, main, open, "\u2225", "\\lVert");
	defineSymbol(math, main, close, ")", ")");
	defineSymbol(math, main, close, "]", "]");
	defineSymbol(math, main, close, "?", "?");
	defineSymbol(math, main, close, "!", "!");
	defineSymbol(math, main, close, "\u27e9", "\\rangle");
	defineSymbol(math, main, close, "\u2223", "\\rvert");
	defineSymbol(math, main, close, "\u2225", "\\rVert");
	defineSymbol(math, main, rel, "=", "=");
	defineSymbol(math, main, rel, "<", "<");
	defineSymbol(math, main, rel, ">", ">");
	defineSymbol(math, main, rel, ":", ":");
	defineSymbol(math, main, rel, "\u2248", "\\approx");
	defineSymbol(math, main, rel, "\u2245", "\\cong");
	defineSymbol(math, main, rel, "\u2265", "\\ge");
	defineSymbol(math, main, rel, "\u2265", "\\geq");
	defineSymbol(math, main, rel, "\u2190", "\\gets");
	defineSymbol(math, main, rel, ">", "\\gt");
	defineSymbol(math, main, rel, "\u2208", "\\in");
	defineSymbol(math, main, rel, "\u2209", "\\notin");
	defineSymbol(math, main, rel, "\u2282", "\\subset");
	defineSymbol(math, main, rel, "\u2283", "\\supset");
	defineSymbol(math, main, rel, "\u2286", "\\subseteq");
	defineSymbol(math, main, rel, "\u2287", "\\supseteq");
	defineSymbol(math, ams, rel, "\u2288", "\\nsubseteq");
	defineSymbol(math, ams, rel, "\u2289", "\\nsupseteq");
	defineSymbol(math, main, rel, "\u22a8", "\\models");
	defineSymbol(math, main, rel, "\u2190", "\\leftarrow");
	defineSymbol(math, main, rel, "\u2264", "\\le");
	defineSymbol(math, main, rel, "\u2264", "\\leq");
	defineSymbol(math, main, rel, "<", "\\lt");
	defineSymbol(math, main, rel, "\u2260", "\\ne");
	defineSymbol(math, main, rel, "\u2260", "\\neq");
	defineSymbol(math, main, rel, "\u2192", "\\rightarrow");
	defineSymbol(math, main, rel, "\u2192", "\\to");
	defineSymbol(math, ams, rel, "\u2271", "\\ngeq");
	defineSymbol(math, ams, rel, "\u2270", "\\nleq");
	defineSymbol(math, main, spacing, null, "\\!");
	defineSymbol(math, main, spacing, "\u00a0", "\\ ");
	defineSymbol(math, main, spacing, "\u00a0", "~");
	defineSymbol(math, main, spacing, null, "\\,");
	defineSymbol(math, main, spacing, null, "\\:");
	defineSymbol(math, main, spacing, null, "\\;");
	defineSymbol(math, main, spacing, null, "\\enspace");
	defineSymbol(math, main, spacing, null, "\\qquad");
	defineSymbol(math, main, spacing, null, "\\quad");
	defineSymbol(math, main, spacing, "\u00a0", "\\space");
	defineSymbol(math, main, punct, ",", ",");
	defineSymbol(math, main, punct, ";", ";");
	defineSymbol(math, main, punct, ":", "\\colon");
	defineSymbol(math, ams, bin, "\u22bc", "\\barwedge");
	defineSymbol(math, ams, bin, "\u22bb", "\\veebar");
	defineSymbol(math, main, bin, "\u2299", "\\odot");
	defineSymbol(math, main, bin, "\u2295", "\\oplus");
	defineSymbol(math, main, bin, "\u2297", "\\otimes");
	defineSymbol(math, main, textord, "\u2202", "\\partial");
	defineSymbol(math, main, bin, "\u2298", "\\oslash");
	defineSymbol(math, ams, bin, "\u229a", "\\circledcirc");
	defineSymbol(math, ams, bin, "\u22a1", "\\boxdot");
	defineSymbol(math, main, bin, "\u25b3", "\\bigtriangleup");
	defineSymbol(math, main, bin, "\u25bd", "\\bigtriangledown");
	defineSymbol(math, main, bin, "\u2020", "\\dagger");
	defineSymbol(math, main, bin, "\u22c4", "\\diamond");
	defineSymbol(math, main, bin, "\u22c6", "\\star");
	defineSymbol(math, main, bin, "\u25c3", "\\triangleleft");
	defineSymbol(math, main, bin, "\u25b9", "\\triangleright");
	defineSymbol(math, main, open, "{", "\\{");
	defineSymbol(math, main, close, "}", "\\}");
	defineSymbol(math, main, open, "{", "\\lbrace");
	defineSymbol(math, main, close, "}", "\\rbrace");
	defineSymbol(math, main, open, "[", "\\lbrack");
	defineSymbol(math, main, close, "]", "\\rbrack");
	defineSymbol(math, main, open, "\u230a", "\\lfloor");
	defineSymbol(math, main, close, "\u230b", "\\rfloor");
	defineSymbol(math, main, open, "\u2308", "\\lceil");
	defineSymbol(math, main, close, "\u2309", "\\rceil");
	defineSymbol(math, main, textord, "\\", "\\backslash");
	defineSymbol(math, main, textord, "\u2223", "|");
	defineSymbol(math, main, textord, "\u2223", "\\vert");
	defineSymbol(math, main, textord, "\u2225", "\\|");
	defineSymbol(math, main, textord, "\u2225", "\\Vert");
	defineSymbol(math, main, rel, "\u2191", "\\uparrow");
	defineSymbol(math, main, rel, "\u21d1", "\\Uparrow");
	defineSymbol(math, main, rel, "\u2193", "\\downarrow");
	defineSymbol(math, main, rel, "\u21d3", "\\Downarrow");
	defineSymbol(math, main, rel, "\u2195", "\\updownarrow");
	defineSymbol(math, main, rel, "\u21d5", "\\Updownarrow");
	defineSymbol(math, math, op, "\u2210", "\\coprod");
	defineSymbol(math, math, op, "\u22c1", "\\bigvee");
	defineSymbol(math, math, op, "\u22c0", "\\bigwedge");
	defineSymbol(math, math, op, "\u2a04", "\\biguplus");
	defineSymbol(math, math, op, "\u22c2", "\\bigcap");
	defineSymbol(math, math, op, "\u22c3", "\\bigcup");
	defineSymbol(math, math, op, "\u222b", "\\int");
	defineSymbol(math, math, op, "\u222b", "\\intop");
	defineSymbol(math, math, op, "\u222c", "\\iint");
	defineSymbol(math, math, op, "\u222d", "\\iiint");
	defineSymbol(math, math, op, "\u220f", "\\prod");
	defineSymbol(math, math, op, "\u2211", "\\sum");
	defineSymbol(math, math, op, "\u2a02", "\\bigotimes");
	defineSymbol(math, math, op, "\u2a01", "\\bigoplus");
	defineSymbol(math, math, op, "\u2a00", "\\bigodot");
	defineSymbol(math, math, op, "\u222e", "\\oint");
	defineSymbol(math, math, op, "\u2a06", "\\bigsqcup");
	defineSymbol(math, math, op, "\u222b", "\\smallint");
	defineSymbol(math, main, inner, "\u2026", "\\ldots");
	defineSymbol(math, main, inner, "\u22ef", "\\cdots");
	defineSymbol(math, main, inner, "\u22f1", "\\ddots");
	defineSymbol(math, main, textord, "\u22ee", "\\vdots");
	defineSymbol(math, main, accent, "\u00b4", "\\acute");
	defineSymbol(math, main, accent, "\u0060", "\\grave");
	defineSymbol(math, main, accent, "\u00a8", "\\ddot");
	defineSymbol(math, main, accent, "\u007e", "\\tilde");
	defineSymbol(math, main, accent, "\u00af", "\\bar");
	defineSymbol(math, main, accent, "\u02d8", "\\breve");
	defineSymbol(math, main, accent, "\u02c7", "\\check");
	defineSymbol(math, main, accent, "\u005e", "\\hat");
	defineSymbol(math, main, accent, "\u20d7", "\\vec");
	defineSymbol(math, main, accent, "\u02d9", "\\dot");
	defineSymbol(math, main, mathord, "\u0131", "\\imath");
	defineSymbol(math, main, mathord, "\u0237", "\\jmath");

	defineSymbol(text, main, spacing, "\u00a0", "\\ ");
	defineSymbol(text, main, spacing, "\u00a0", " ");
	defineSymbol(text, main, spacing, "\u00a0", "~");

	// There are lots of symbols which are the same, so we add them in afterwards.
	var i;
	var ch;

	// All of these are textords in math mode
	var mathTextSymbols = "0123456789/@.\"";
	for (i = 0; i < mathTextSymbols.length; i++) {
	    ch = mathTextSymbols.charAt(i);
	    defineSymbol(math, main, textord, ch, ch);
	}

	// All of these are textords in text mode
	var textSymbols = "0123456789`!@*()-=+[]'\";:?/.,";
	for (i = 0; i < textSymbols.length; i++) {
	    ch = textSymbols.charAt(i);
	    defineSymbol(text, main, textord, ch, ch);
	}

	// All of these are textords in text mode, and mathords in math mode
	var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for (i = 0; i < letters.length; i++) {
	    ch = letters.charAt(i);
	    defineSymbol(math, main, mathord, ch, ch);
	    defineSymbol(text, main, textord, ch, ch);
	}


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This file deals with creating delimiters of various sizes. The TeXbook
	 * discusses these routines on page 441-442, in the "Another subroutine sets box
	 * x to a specified variable delimiter" paragraph.
	 *
	 * There are three main routines here. `makeSmallDelim` makes a delimiter in the
	 * normal font, but in either text, script, or scriptscript style.
	 * `makeLargeDelim` makes a delimiter in textstyle, but in one of the Size1,
	 * Size2, Size3, or Size4 fonts. `makeStackedDelim` makes a delimiter out of
	 * smaller pieces that are stacked on top of one another.
	 *
	 * The functions take a parameter `center`, which determines if the delimiter
	 * should be centered around the axis.
	 *
	 * Then, there are three exposed functions. `sizedDelim` makes a delimiter in
	 * one of the given sizes. This is used for things like `\bigl`.
	 * `customSizedDelim` makes a delimiter with a given total height+depth. It is
	 * called in places like `\sqrt`. `leftRightDelim` makes an appropriate
	 * delimiter which surrounds an expression of a given height an depth. It is
	 * used in `\left` and `\right`.
	 */

	var ParseError = __webpack_require__(72);
	var Style = __webpack_require__(76);

	var buildCommon = __webpack_require__(77);
	var fontMetrics = __webpack_require__(80);
	var symbols = __webpack_require__(82);
	var utils = __webpack_require__(79);

	var makeSpan = buildCommon.makeSpan;

	/**
	 * Get the metrics for a given symbol and font, after transformation (i.e.
	 * after following replacement from symbols.js)
	 */
	var getMetrics = function(symbol, font) {
	    if (symbols.math[symbol] && symbols.math[symbol].replace) {
	        return fontMetrics.getCharacterMetrics(
	            symbols.math[symbol].replace, font);
	    } else {
	        return fontMetrics.getCharacterMetrics(
	            symbol, font);
	    }
	};

	/**
	 * Builds a symbol in the given font size (note size is an integer)
	 */
	var mathrmSize = function(value, size, mode) {
	    return buildCommon.makeSymbol(value, "Size" + size + "-Regular", mode);
	};

	/**
	 * Puts a delimiter span in a given style, and adds appropriate height, depth,
	 * and maxFontSizes.
	 */
	var styleWrap = function(delim, toStyle, options) {
	    var span = makeSpan(
	        ["style-wrap", options.style.reset(), toStyle.cls()], [delim]);

	    var multiplier = toStyle.sizeMultiplier / options.style.sizeMultiplier;

	    span.height *= multiplier;
	    span.depth *= multiplier;
	    span.maxFontSize = toStyle.sizeMultiplier;

	    return span;
	};

	/**
	 * Makes a small delimiter. This is a delimiter that comes in the Main-Regular
	 * font, but is restyled to either be in textstyle, scriptstyle, or
	 * scriptscriptstyle.
	 */
	var makeSmallDelim = function(delim, style, center, options, mode) {
	    var text = buildCommon.makeSymbol(delim, "Main-Regular", mode);

	    var span = styleWrap(text, style, options);

	    if (center) {
	        var shift =
	            (1 - options.style.sizeMultiplier / style.sizeMultiplier) *
	            fontMetrics.metrics.axisHeight;

	        span.style.top = shift + "em";
	        span.height -= shift;
	        span.depth += shift;
	    }

	    return span;
	};

	/**
	 * Makes a large delimiter. This is a delimiter that comes in the Size1, Size2,
	 * Size3, or Size4 fonts. It is always rendered in textstyle.
	 */
	var makeLargeDelim = function(delim, size, center, options, mode) {
	    var inner = mathrmSize(delim, size, mode);

	    var span = styleWrap(
	        makeSpan(["delimsizing", "size" + size],
	                 [inner], options.getColor()),
	        Style.TEXT, options);

	    if (center) {
	        var shift = (1 - options.style.sizeMultiplier) *
	            fontMetrics.metrics.axisHeight;

	        span.style.top = shift + "em";
	        span.height -= shift;
	        span.depth += shift;
	    }

	    return span;
	};

	/**
	 * Make an inner span with the given offset and in the given font. This is used
	 * in `makeStackedDelim` to make the stacking pieces for the delimiter.
	 */
	var makeInner = function(symbol, font, mode) {
	    var sizeClass;
	    // Apply the correct CSS class to choose the right font.
	    if (font === "Size1-Regular") {
	        sizeClass = "delim-size1";
	    } else if (font === "Size4-Regular") {
	        sizeClass = "delim-size4";
	    }

	    var inner = makeSpan(
	        ["delimsizinginner", sizeClass],
	        [makeSpan([], [buildCommon.makeSymbol(symbol, font, mode)])]);

	    // Since this will be passed into `makeVList` in the end, wrap the element
	    // in the appropriate tag that VList uses.
	    return {type: "elem", elem: inner};
	};

	/**
	 * Make a stacked delimiter out of a given delimiter, with the total height at
	 * least `heightTotal`. This routine is mentioned on page 442 of the TeXbook.
	 */
	var makeStackedDelim = function(delim, heightTotal, center, options, mode) {
	    // There are four parts, the top, an optional middle, a repeated part, and a
	    // bottom.
	    var top;
	    var middle;
	    var repeat;
	    var bottom;
	    top = repeat = bottom = delim;
	    middle = null;
	    // Also keep track of what font the delimiters are in
	    var font = "Size1-Regular";

	    // We set the parts and font based on the symbol. Note that we use
	    // '\u23d0' instead of '|' and '\u2016' instead of '\\|' for the
	    // repeats of the arrows
	    if (delim === "\\uparrow") {
	        repeat = bottom = "\u23d0";
	    } else if (delim === "\\Uparrow") {
	        repeat = bottom = "\u2016";
	    } else if (delim === "\\downarrow") {
	        top = repeat = "\u23d0";
	    } else if (delim === "\\Downarrow") {
	        top = repeat = "\u2016";
	    } else if (delim === "\\updownarrow") {
	        top = "\\uparrow";
	        repeat = "\u23d0";
	        bottom = "\\downarrow";
	    } else if (delim === "\\Updownarrow") {
	        top = "\\Uparrow";
	        repeat = "\u2016";
	        bottom = "\\Downarrow";
	    } else if (delim === "[" || delim === "\\lbrack") {
	        top = "\u23a1";
	        repeat = "\u23a2";
	        bottom = "\u23a3";
	        font = "Size4-Regular";
	    } else if (delim === "]" || delim === "\\rbrack") {
	        top = "\u23a4";
	        repeat = "\u23a5";
	        bottom = "\u23a6";
	        font = "Size4-Regular";
	    } else if (delim === "\\lfloor") {
	        repeat = top = "\u23a2";
	        bottom = "\u23a3";
	        font = "Size4-Regular";
	    } else if (delim === "\\lceil") {
	        top = "\u23a1";
	        repeat = bottom = "\u23a2";
	        font = "Size4-Regular";
	    } else if (delim === "\\rfloor") {
	        repeat = top = "\u23a5";
	        bottom = "\u23a6";
	        font = "Size4-Regular";
	    } else if (delim === "\\rceil") {
	        top = "\u23a4";
	        repeat = bottom = "\u23a5";
	        font = "Size4-Regular";
	    } else if (delim === "(") {
	        top = "\u239b";
	        repeat = "\u239c";
	        bottom = "\u239d";
	        font = "Size4-Regular";
	    } else if (delim === ")") {
	        top = "\u239e";
	        repeat = "\u239f";
	        bottom = "\u23a0";
	        font = "Size4-Regular";
	    } else if (delim === "\\{" || delim === "\\lbrace") {
	        top = "\u23a7";
	        middle = "\u23a8";
	        bottom = "\u23a9";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\}" || delim === "\\rbrace") {
	        top = "\u23ab";
	        middle = "\u23ac";
	        bottom = "\u23ad";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\lgroup") {
	        top = "\u23a7";
	        bottom = "\u23a9";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\rgroup") {
	        top = "\u23ab";
	        bottom = "\u23ad";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\lmoustache") {
	        top = "\u23a7";
	        bottom = "\u23ad";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\rmoustache") {
	        top = "\u23ab";
	        bottom = "\u23a9";
	        repeat = "\u23aa";
	        font = "Size4-Regular";
	    } else if (delim === "\\surd") {
	        top = "\ue001";
	        bottom = "\u23b7";
	        repeat = "\ue000";
	        font = "Size4-Regular";
	    }

	    // Get the metrics of the four sections
	    var topMetrics = getMetrics(top, font);
	    var topHeightTotal = topMetrics.height + topMetrics.depth;
	    var repeatMetrics = getMetrics(repeat, font);
	    var repeatHeightTotal = repeatMetrics.height + repeatMetrics.depth;
	    var bottomMetrics = getMetrics(bottom, font);
	    var bottomHeightTotal = bottomMetrics.height + bottomMetrics.depth;
	    var middleHeightTotal = 0;
	    var middleFactor = 1;
	    if (middle !== null) {
	        var middleMetrics = getMetrics(middle, font);
	        middleHeightTotal = middleMetrics.height + middleMetrics.depth;
	        middleFactor = 2; // repeat symmetrically above and below middle
	    }

	    // Calcuate the minimal height that the delimiter can have.
	    // It is at least the size of the top, bottom, and optional middle combined.
	    var minHeight = topHeightTotal + bottomHeightTotal + middleHeightTotal;

	    // Compute the number of copies of the repeat symbol we will need
	    var repeatCount = Math.ceil(
	        (heightTotal - minHeight) / (middleFactor * repeatHeightTotal));

	    // Compute the total height of the delimiter including all the symbols
	    var realHeightTotal =
	        minHeight + repeatCount * middleFactor * repeatHeightTotal;

	    // The center of the delimiter is placed at the center of the axis. Note
	    // that in this context, "center" means that the delimiter should be
	    // centered around the axis in the current style, while normally it is
	    // centered around the axis in textstyle.
	    var axisHeight = fontMetrics.metrics.axisHeight;
	    if (center) {
	        axisHeight *= options.style.sizeMultiplier;
	    }
	    // Calculate the depth
	    var depth = realHeightTotal / 2 - axisHeight;

	    // Now, we start building the pieces that will go into the vlist

	    // Keep a list of the inner pieces
	    var inners = [];

	    // Add the bottom symbol
	    inners.push(makeInner(bottom, font, mode));

	    var i;
	    if (middle === null) {
	        // Add that many symbols
	        for (i = 0; i < repeatCount; i++) {
	            inners.push(makeInner(repeat, font, mode));
	        }
	    } else {
	        // When there is a middle bit, we need the middle part and two repeated
	        // sections
	        for (i = 0; i < repeatCount; i++) {
	            inners.push(makeInner(repeat, font, mode));
	        }
	        inners.push(makeInner(middle, font, mode));
	        for (i = 0; i < repeatCount; i++) {
	            inners.push(makeInner(repeat, font, mode));
	        }
	    }

	    // Add the top symbol
	    inners.push(makeInner(top, font, mode));

	    // Finally, build the vlist
	    var inner = buildCommon.makeVList(inners, "bottom", depth, options);

	    return styleWrap(
	        makeSpan(["delimsizing", "mult"], [inner], options.getColor()),
	        Style.TEXT, options);
	};

	// There are three kinds of delimiters, delimiters that stack when they become
	// too large
	var stackLargeDelimiters = [
	    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
	    "\\{", "\\lbrace", "\\}", "\\rbrace",
	    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
	    "\\surd",
	];

	// delimiters that always stack
	var stackAlwaysDelimiters = [
	    "\\uparrow", "\\downarrow", "\\updownarrow",
	    "\\Uparrow", "\\Downarrow", "\\Updownarrow",
	    "|", "\\|", "\\vert", "\\Vert",
	    "\\lvert", "\\rvert", "\\lVert", "\\rVert",
	    "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache",
	];

	// and delimiters that never stack
	var stackNeverDelimiters = [
	    "<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt",
	];

	// Metrics of the different sizes. Found by looking at TeX's output of
	// $\bigl| // \Bigl| \biggl| \Biggl| \showlists$
	// Used to create stacked delimiters of appropriate sizes in makeSizedDelim.
	var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3.0];

	/**
	 * Used to create a delimiter of a specific size, where `size` is 1, 2, 3, or 4.
	 */
	var makeSizedDelim = function(delim, size, options, mode) {
	    // < and > turn into \langle and \rangle in delimiters
	    if (delim === "<" || delim === "\\lt") {
	        delim = "\\langle";
	    } else if (delim === ">" || delim === "\\gt") {
	        delim = "\\rangle";
	    }

	    // Sized delimiters are never centered.
	    if (utils.contains(stackLargeDelimiters, delim) ||
	        utils.contains(stackNeverDelimiters, delim)) {
	        return makeLargeDelim(delim, size, false, options, mode);
	    } else if (utils.contains(stackAlwaysDelimiters, delim)) {
	        return makeStackedDelim(
	            delim, sizeToMaxHeight[size], false, options, mode);
	    } else {
	        throw new ParseError("Illegal delimiter: '" + delim + "'");
	    }
	};

	/**
	 * There are three different sequences of delimiter sizes that the delimiters
	 * follow depending on the kind of delimiter. This is used when creating custom
	 * sized delimiters to decide whether to create a small, large, or stacked
	 * delimiter.
	 *
	 * In real TeX, these sequences aren't explicitly defined, but are instead
	 * defined inside the font metrics. Since there are only three sequences that
	 * are possible for the delimiters that TeX defines, it is easier to just encode
	 * them explicitly here.
	 */

	// Delimiters that never stack try small delimiters and large delimiters only
	var stackNeverDelimiterSequence = [
	    {type: "small", style: Style.SCRIPTSCRIPT},
	    {type: "small", style: Style.SCRIPT},
	    {type: "small", style: Style.TEXT},
	    {type: "large", size: 1},
	    {type: "large", size: 2},
	    {type: "large", size: 3},
	    {type: "large", size: 4},
	];

	// Delimiters that always stack try the small delimiters first, then stack
	var stackAlwaysDelimiterSequence = [
	    {type: "small", style: Style.SCRIPTSCRIPT},
	    {type: "small", style: Style.SCRIPT},
	    {type: "small", style: Style.TEXT},
	    {type: "stack"},
	];

	// Delimiters that stack when large try the small and then large delimiters, and
	// stack afterwards
	var stackLargeDelimiterSequence = [
	    {type: "small", style: Style.SCRIPTSCRIPT},
	    {type: "small", style: Style.SCRIPT},
	    {type: "small", style: Style.TEXT},
	    {type: "large", size: 1},
	    {type: "large", size: 2},
	    {type: "large", size: 3},
	    {type: "large", size: 4},
	    {type: "stack"},
	];

	/**
	 * Get the font used in a delimiter based on what kind of delimiter it is.
	 */
	var delimTypeToFont = function(type) {
	    if (type.type === "small") {
	        return "Main-Regular";
	    } else if (type.type === "large") {
	        return "Size" + type.size + "-Regular";
	    } else if (type.type === "stack") {
	        return "Size4-Regular";
	    }
	};

	/**
	 * Traverse a sequence of types of delimiters to decide what kind of delimiter
	 * should be used to create a delimiter of the given height+depth.
	 */
	var traverseSequence = function(delim, height, sequence, options) {
	    // Here, we choose the index we should start at in the sequences. In smaller
	    // sizes (which correspond to larger numbers in style.size) we start earlier
	    // in the sequence. Thus, scriptscript starts at index 3-3=0, script starts
	    // at index 3-2=1, text starts at 3-1=2, and display starts at min(2,3-0)=2
	    var start = Math.min(2, 3 - options.style.size);
	    for (var i = start; i < sequence.length; i++) {
	        if (sequence[i].type === "stack") {
	            // This is always the last delimiter, so we just break the loop now.
	            break;
	        }

	        var metrics = getMetrics(delim, delimTypeToFont(sequence[i]));
	        var heightDepth = metrics.height + metrics.depth;

	        // Small delimiters are scaled down versions of the same font, so we
	        // account for the style change size.

	        if (sequence[i].type === "small") {
	            heightDepth *= sequence[i].style.sizeMultiplier;
	        }

	        // Check if the delimiter at this size works for the given height.
	        if (heightDepth > height) {
	            return sequence[i];
	        }
	    }

	    // If we reached the end of the sequence, return the last sequence element.
	    return sequence[sequence.length - 1];
	};

	/**
	 * Make a delimiter of a given height+depth, with optional centering. Here, we
	 * traverse the sequences, and create a delimiter that the sequence tells us to.
	 */
	var makeCustomSizedDelim = function(delim, height, center, options, mode) {
	    if (delim === "<" || delim === "\\lt") {
	        delim = "\\langle";
	    } else if (delim === ">" || delim === "\\gt") {
	        delim = "\\rangle";
	    }

	    // Decide what sequence to use
	    var sequence;
	    if (utils.contains(stackNeverDelimiters, delim)) {
	        sequence = stackNeverDelimiterSequence;
	    } else if (utils.contains(stackLargeDelimiters, delim)) {
	        sequence = stackLargeDelimiterSequence;
	    } else {
	        sequence = stackAlwaysDelimiterSequence;
	    }

	    // Look through the sequence
	    var delimType = traverseSequence(delim, height, sequence, options);

	    // Depending on the sequence element we decided on, call the appropriate
	    // function.
	    if (delimType.type === "small") {
	        return makeSmallDelim(delim, delimType.style, center, options, mode);
	    } else if (delimType.type === "large") {
	        return makeLargeDelim(delim, delimType.size, center, options, mode);
	    } else if (delimType.type === "stack") {
	        return makeStackedDelim(delim, height, center, options, mode);
	    }
	};

	/**
	 * Make a delimiter for use with `\left` and `\right`, given a height and depth
	 * of an expression that the delimiters surround.
	 */
	var makeLeftRightDelim = function(delim, height, depth, options, mode) {
	    // We always center \left/\right delimiters, so the axis is always shifted
	    var axisHeight =
	        fontMetrics.metrics.axisHeight * options.style.sizeMultiplier;

	    // Taken from TeX source, tex.web, function make_left_right
	    var delimiterFactor = 901;
	    var delimiterExtend = 5.0 / fontMetrics.metrics.ptPerEm;

	    var maxDistFromAxis = Math.max(
	        height - axisHeight, depth + axisHeight);

	    var totalHeight = Math.max(
	        // In real TeX, calculations are done using integral values which are
	        // 65536 per pt, or 655360 per em. So, the division here truncates in
	        // TeX but doesn't here, producing different results. If we wanted to
	        // exactly match TeX's calculation, we could do
	        //   Math.floor(655360 * maxDistFromAxis / 500) *
	        //    delimiterFactor / 655360
	        // (To see the difference, compare
	        //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
	        // in TeX and KaTeX)
	        maxDistFromAxis / 500 * delimiterFactor,
	        2 * maxDistFromAxis - delimiterExtend);

	    // Finally, we defer to `makeCustomSizedDelim` with our calculated total
	    // height
	    return makeCustomSizedDelim(delim, totalHeight, true, options, mode);
	};

	module.exports = {
	    sizedDelim: makeSizedDelim,
	    customSizedDelim: makeCustomSizedDelim,
	    leftRightDelim: makeLeftRightDelim,
	};


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This file converts a parse tree into a cooresponding MathML tree. The main
	 * entry point is the `buildMathML` function, which takes a parse tree from the
	 * parser.
	 */

	var buildCommon = __webpack_require__(77);
	var fontMetrics = __webpack_require__(80);
	var mathMLTree = __webpack_require__(85);
	var ParseError = __webpack_require__(72);
	var symbols = __webpack_require__(82);
	var utils = __webpack_require__(79);

	var makeSpan = buildCommon.makeSpan;
	var fontMap = buildCommon.fontMap;

	/**
	 * Takes a symbol and converts it into a MathML text node after performing
	 * optional replacement from symbols.js.
	 */
	var makeText = function(text, mode) {
	    if (symbols[mode][text] && symbols[mode][text].replace) {
	        text = symbols[mode][text].replace;
	    }

	    return new mathMLTree.TextNode(text);
	};

	/**
	 * Returns the math variant as a string or null if none is required.
	 */
	var getVariant = function(group, options) {
	    var font = options.font;
	    if (!font) {
	        return null;
	    }

	    var mode = group.mode;
	    if (font === "mathit") {
	        return "italic";
	    }

	    var value = group.value;
	    if (utils.contains(["\\imath", "\\jmath"], value)) {
	        return null;
	    }

	    if (symbols[mode][value] && symbols[mode][value].replace) {
	        value = symbols[mode][value].replace;
	    }

	    var fontName = fontMap[font].fontName;
	    if (fontMetrics.getCharacterMetrics(value, fontName)) {
	        return fontMap[options.font].variant;
	    }

	    return null;
	};

	/**
	 * Functions for handling the different types of groups found in the parse
	 * tree. Each function should take a parse group and return a MathML node.
	 */
	var groupTypes = {};

	groupTypes.mathord = function(group, options) {
	    var node = new mathMLTree.MathNode(
	        "mi",
	        [makeText(group.value, group.mode)]);

	    var variant = getVariant(group, options);
	    if (variant) {
	        node.setAttribute("mathvariant", variant);
	    }
	    return node;
	};

	groupTypes.textord = function(group, options) {
	    var text = makeText(group.value, group.mode);

	    var variant = getVariant(group, options) || "normal";

	    var node;
	    if (/[0-9]/.test(group.value)) {
	        // TODO(kevinb) merge adjacent <mn> nodes
	        // do it as a post processing step
	        node = new mathMLTree.MathNode("mn", [text]);
	        if (options.font) {
	            node.setAttribute("mathvariant", variant);
	        }
	    } else {
	        node = new mathMLTree.MathNode("mi", [text]);
	        node.setAttribute("mathvariant", variant);
	    }

	    return node;
	};

	groupTypes.bin = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    return node;
	};

	groupTypes.rel = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    return node;
	};

	groupTypes.open = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    return node;
	};

	groupTypes.close = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    return node;
	};

	groupTypes.inner = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    return node;
	};

	groupTypes.punct = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mo", [makeText(group.value, group.mode)]);

	    node.setAttribute("separator", "true");

	    return node;
	};

	groupTypes.ordgroup = function(group, options) {
	    var inner = buildExpression(group.value, options);

	    var node = new mathMLTree.MathNode("mrow", inner);

	    return node;
	};

	groupTypes.text = function(group, options) {
	    var inner = buildExpression(group.value.body, options);

	    var node = new mathMLTree.MathNode("mtext", inner);

	    return node;
	};

	groupTypes.color = function(group, options) {
	    var inner = buildExpression(group.value.value, options);

	    var node = new mathMLTree.MathNode("mstyle", inner);

	    node.setAttribute("mathcolor", group.value.color);

	    return node;
	};

	groupTypes.supsub = function(group, options) {
	    var children = [buildGroup(group.value.base, options)];

	    if (group.value.sub) {
	        children.push(buildGroup(group.value.sub, options));
	    }

	    if (group.value.sup) {
	        children.push(buildGroup(group.value.sup, options));
	    }

	    var nodeType;
	    if (!group.value.sub) {
	        nodeType = "msup";
	    } else if (!group.value.sup) {
	        nodeType = "msub";
	    } else {
	        nodeType = "msubsup";
	    }

	    var node = new mathMLTree.MathNode(nodeType, children);

	    return node;
	};

	groupTypes.genfrac = function(group, options) {
	    var node = new mathMLTree.MathNode(
	        "mfrac",
	        [buildGroup(group.value.numer, options),
	         buildGroup(group.value.denom, options)]);

	    if (!group.value.hasBarLine) {
	        node.setAttribute("linethickness", "0px");
	    }

	    if (group.value.leftDelim != null || group.value.rightDelim != null) {
	        var withDelims = [];

	        if (group.value.leftDelim != null) {
	            var leftOp = new mathMLTree.MathNode(
	                "mo", [new mathMLTree.TextNode(group.value.leftDelim)]);

	            leftOp.setAttribute("fence", "true");

	            withDelims.push(leftOp);
	        }

	        withDelims.push(node);

	        if (group.value.rightDelim != null) {
	            var rightOp = new mathMLTree.MathNode(
	                "mo", [new mathMLTree.TextNode(group.value.rightDelim)]);

	            rightOp.setAttribute("fence", "true");

	            withDelims.push(rightOp);
	        }

	        var outerNode = new mathMLTree.MathNode("mrow", withDelims);

	        return outerNode;
	    }

	    return node;
	};

	groupTypes.array = function(group, options) {
	    return new mathMLTree.MathNode(
	        "mtable", group.value.body.map(function(row) {
	            return new mathMLTree.MathNode(
	                "mtr", row.map(function(cell) {
	                    return new mathMLTree.MathNode(
	                        "mtd", [buildGroup(cell, options)]);
	                }));
	        }));
	};

	groupTypes.sqrt = function(group, options) {
	    var node;
	    if (group.value.index) {
	        node = new mathMLTree.MathNode(
	            "mroot", [
	                buildGroup(group.value.body, options),
	                buildGroup(group.value.index, options),
	            ]);
	    } else {
	        node = new mathMLTree.MathNode(
	            "msqrt", [buildGroup(group.value.body, options)]);
	    }

	    return node;
	};

	groupTypes.leftright = function(group, options) {
	    var inner = buildExpression(group.value.body, options);

	    if (group.value.left !== ".") {
	        var leftNode = new mathMLTree.MathNode(
	            "mo", [makeText(group.value.left, group.mode)]);

	        leftNode.setAttribute("fence", "true");

	        inner.unshift(leftNode);
	    }

	    if (group.value.right !== ".") {
	        var rightNode = new mathMLTree.MathNode(
	            "mo", [makeText(group.value.right, group.mode)]);

	        rightNode.setAttribute("fence", "true");

	        inner.push(rightNode);
	    }

	    var outerNode = new mathMLTree.MathNode("mrow", inner);

	    return outerNode;
	};

	groupTypes.accent = function(group, options) {
	    var accentNode = new mathMLTree.MathNode(
	        "mo", [makeText(group.value.accent, group.mode)]);

	    var node = new mathMLTree.MathNode(
	        "mover",
	        [buildGroup(group.value.base, options),
	         accentNode]);

	    node.setAttribute("accent", "true");

	    return node;
	};

	groupTypes.spacing = function(group) {
	    var node;

	    if (group.value === "\\ " || group.value === "\\space" ||
	        group.value === " " || group.value === "~") {
	        node = new mathMLTree.MathNode(
	            "mtext", [new mathMLTree.TextNode("\u00a0")]);
	    } else {
	        node = new mathMLTree.MathNode("mspace");

	        node.setAttribute(
	            "width", buildCommon.spacingFunctions[group.value].size);
	    }

	    return node;
	};

	groupTypes.op = function(group) {
	    var node;

	    // TODO(emily): handle big operators using the `largeop` attribute

	    if (group.value.symbol) {
	        // This is a symbol. Just add the symbol.
	        node = new mathMLTree.MathNode(
	            "mo", [makeText(group.value.body, group.mode)]);
	    } else {
	        // This is a text operator. Add all of the characters from the
	        // operator's name.
	        // TODO(emily): Add a space in the middle of some of these
	        // operators, like \limsup.
	        node = new mathMLTree.MathNode(
	            "mi", [new mathMLTree.TextNode(group.value.body.slice(1))]);
	    }

	    return node;
	};

	groupTypes.katex = function(group) {
	    var node = new mathMLTree.MathNode(
	        "mtext", [new mathMLTree.TextNode("KaTeX")]);

	    return node;
	};

	groupTypes.font = function(group, options) {
	    var font = group.value.font;
	    return buildGroup(group.value.body, options.withFont(font));
	};

	groupTypes.delimsizing = function(group) {
	    var children = [];

	    if (group.value.value !== ".") {
	        children.push(makeText(group.value.value, group.mode));
	    }

	    var node = new mathMLTree.MathNode("mo", children);

	    if (group.value.delimType === "open" ||
	        group.value.delimType === "close") {
	        // Only some of the delimsizing functions act as fences, and they
	        // return "open" or "close" delimTypes.
	        node.setAttribute("fence", "true");
	    } else {
	        // Explicitly disable fencing if it's not a fence, to override the
	        // defaults.
	        node.setAttribute("fence", "false");
	    }

	    return node;
	};

	groupTypes.styling = function(group, options) {
	    var inner = buildExpression(group.value.value, options);

	    var node = new mathMLTree.MathNode("mstyle", inner);

	    var styleAttributes = {
	        "display": ["0", "true"],
	        "text": ["0", "false"],
	        "script": ["1", "false"],
	        "scriptscript": ["2", "false"],
	    };

	    var attr = styleAttributes[group.value.style];

	    node.setAttribute("scriptlevel", attr[0]);
	    node.setAttribute("displaystyle", attr[1]);

	    return node;
	};

	groupTypes.sizing = function(group, options) {
	    var inner = buildExpression(group.value.value, options);

	    var node = new mathMLTree.MathNode("mstyle", inner);

	    // TODO(emily): This doesn't produce the correct size for nested size
	    // changes, because we don't keep state of what style we're currently
	    // in, so we can't reset the size to normal before changing it.  Now
	    // that we're passing an options parameter we should be able to fix
	    // this.
	    node.setAttribute(
	        "mathsize", buildCommon.sizingMultiplier[group.value.size] + "em");

	    return node;
	};

	groupTypes.overline = function(group, options) {
	    var operator = new mathMLTree.MathNode(
	        "mo", [new mathMLTree.TextNode("\u203e")]);
	    operator.setAttribute("stretchy", "true");

	    var node = new mathMLTree.MathNode(
	        "mover",
	        [buildGroup(group.value.body, options),
	         operator]);
	    node.setAttribute("accent", "true");

	    return node;
	};

	groupTypes.underline = function(group, options) {
	    var operator = new mathMLTree.MathNode(
	        "mo", [new mathMLTree.TextNode("\u203e")]);
	    operator.setAttribute("stretchy", "true");

	    var node = new mathMLTree.MathNode(
	        "munder",
	        [buildGroup(group.value.body, options),
	         operator]);
	    node.setAttribute("accentunder", "true");

	    return node;
	};

	groupTypes.rule = function(group) {
	    // TODO(emily): Figure out if there's an actual way to draw black boxes
	    // in MathML.
	    var node = new mathMLTree.MathNode("mrow");

	    return node;
	};

	groupTypes.llap = function(group, options) {
	    var node = new mathMLTree.MathNode(
	        "mpadded", [buildGroup(group.value.body, options)]);

	    node.setAttribute("lspace", "-1width");
	    node.setAttribute("width", "0px");

	    return node;
	};

	groupTypes.rlap = function(group, options) {
	    var node = new mathMLTree.MathNode(
	        "mpadded", [buildGroup(group.value.body, options)]);

	    node.setAttribute("width", "0px");

	    return node;
	};

	groupTypes.phantom = function(group, options, prev) {
	    var inner = buildExpression(group.value.value, options);
	    return new mathMLTree.MathNode("mphantom", inner);
	};

	/**
	 * Takes a list of nodes, builds them, and returns a list of the generated
	 * MathML nodes. A little simpler than the HTML version because we don't do any
	 * previous-node handling.
	 */
	var buildExpression = function(expression, options) {
	    var groups = [];
	    for (var i = 0; i < expression.length; i++) {
	        var group = expression[i];
	        groups.push(buildGroup(group, options));
	    }
	    return groups;
	};

	/**
	 * Takes a group from the parser and calls the appropriate groupTypes function
	 * on it to produce a MathML node.
	 */
	var buildGroup = function(group, options) {
	    if (!group) {
	        return new mathMLTree.MathNode("mrow");
	    }

	    if (groupTypes[group.type]) {
	        // Call the groupTypes function
	        return groupTypes[group.type](group, options);
	    } else {
	        throw new ParseError(
	            "Got group of unknown type: '" + group.type + "'");
	    }
	};

	/**
	 * Takes a full parse tree and settings and builds a MathML representation of
	 * it. In particular, we put the elements from building the parse tree into a
	 * <semantics> tag so we can also include that TeX source as an annotation.
	 *
	 * Note that we actually return a domTree element with a `<math>` inside it so
	 * we can do appropriate styling.
	 */
	var buildMathML = function(tree, texExpression, options) {
	    var expression = buildExpression(tree, options);

	    // Wrap up the expression in an mrow so it is presented in the semantics
	    // tag correctly.
	    var wrapper = new mathMLTree.MathNode("mrow", expression);

	    // Build a TeX annotation of the source
	    var annotation = new mathMLTree.MathNode(
	        "annotation", [new mathMLTree.TextNode(texExpression)]);

	    annotation.setAttribute("encoding", "application/x-tex");

	    var semantics = new mathMLTree.MathNode(
	        "semantics", [wrapper, annotation]);

	    var math = new mathMLTree.MathNode("math", [semantics]);

	    // You can't style <math> nodes, so we wrap the node in a span.
	    return makeSpan(["katex-mathml"], [math]);
	};

	module.exports = buildMathML;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * These objects store data about MathML nodes. This is the MathML equivalent
	 * of the types in domTree.js. Since MathML handles its own rendering, and
	 * since we're mainly using MathML to improve accessibility, we don't manage
	 * any of the styling state that the plain DOM nodes do.
	 *
	 * The `toNode` and `toMarkup` functions work simlarly to how they do in
	 * domTree.js, creating namespaced DOM nodes and HTML text markup respectively.
	 */

	var utils = __webpack_require__(79);

	/**
	 * This node represents a general purpose MathML node of any type. The
	 * constructor requires the type of node to create (for example, `"mo"` or
	 * `"mspace"`, corresponding to `<mo>` and `<mspace>` tags).
	 */
	function MathNode(type, children) {
	    this.type = type;
	    this.attributes = {};
	    this.children = children || [];
	}

	/**
	 * Sets an attribute on a MathML node. MathML depends on attributes to convey a
	 * semantic content, so this is used heavily.
	 */
	MathNode.prototype.setAttribute = function(name, value) {
	    this.attributes[name] = value;
	};

	/**
	 * Converts the math node into a MathML-namespaced DOM element.
	 */
	MathNode.prototype.toNode = function() {
	    var node = document.createElementNS(
	        "http://www.w3.org/1998/Math/MathML", this.type);

	    for (var attr in this.attributes) {
	        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
	            node.setAttribute(attr, this.attributes[attr]);
	        }
	    }

	    for (var i = 0; i < this.children.length; i++) {
	        node.appendChild(this.children[i].toNode());
	    }

	    return node;
	};

	/**
	 * Converts the math node into an HTML markup string.
	 */
	MathNode.prototype.toMarkup = function() {
	    var markup = "<" + this.type;

	    // Add the attributes
	    for (var attr in this.attributes) {
	        if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
	            markup += " " + attr + "=\"";
	            markup += utils.escape(this.attributes[attr]);
	            markup += "\"";
	        }
	    }

	    markup += ">";

	    for (var i = 0; i < this.children.length; i++) {
	        markup += this.children[i].toMarkup();
	    }

	    markup += "</" + this.type + ">";

	    return markup;
	};

	/**
	 * This node represents a piece of text.
	 */
	function TextNode(text) {
	    this.text = text;
	}

	/**
	 * Converts the text node into a DOM text node.
	 */
	TextNode.prototype.toNode = function() {
	    return document.createTextNode(this.text);
	};

	/**
	 * Converts the text node into HTML markup (which is just the text itself).
	 */
	TextNode.prototype.toMarkup = function() {
	    return utils.escape(this.text);
	};

	module.exports = {
	    MathNode: MathNode,
	    TextNode: TextNode,
	};


/***/ },
/* 86 */
/***/ function(module, exports) {

	/**
	 * This file contains information about the options that the Parser carries
	 * around with it while parsing. Data is held in an `Options` object, and when
	 * recursing, a new `Options` object can be created with the `.with*` and
	 * `.reset` functions.
	 */

	/**
	 * This is the main options class. It contains the style, size, color, and font
	 * of the current parse level. It also contains the style and size of the parent
	 * parse level, so size changes can be handled efficiently.
	 *
	 * Each of the `.with*` and `.reset` functions passes its current style and size
	 * as the parentStyle and parentSize of the new options class, so parent
	 * handling is taken care of automatically.
	 */
	function Options(data) {
	    this.style = data.style;
	    this.color = data.color;
	    this.size = data.size;
	    this.phantom = data.phantom;
	    this.font = data.font;

	    if (data.parentStyle === undefined) {
	        this.parentStyle = data.style;
	    } else {
	        this.parentStyle = data.parentStyle;
	    }

	    if (data.parentSize === undefined) {
	        this.parentSize = data.size;
	    } else {
	        this.parentSize = data.parentSize;
	    }
	}

	/**
	 * Returns a new options object with the same properties as "this".  Properties
	 * from "extension" will be copied to the new options object.
	 */
	Options.prototype.extend = function(extension) {
	    var data = {
	        style: this.style,
	        size: this.size,
	        color: this.color,
	        parentStyle: this.style,
	        parentSize: this.size,
	        phantom: this.phantom,
	        font: this.font,
	    };

	    for (var key in extension) {
	        if (extension.hasOwnProperty(key)) {
	            data[key] = extension[key];
	        }
	    }

	    return new Options(data);
	};

	/**
	 * Create a new options object with the given style.
	 */
	Options.prototype.withStyle = function(style) {
	    return this.extend({
	        style: style,
	    });
	};

	/**
	 * Create a new options object with the given size.
	 */
	Options.prototype.withSize = function(size) {
	    return this.extend({
	        size: size,
	    });
	};

	/**
	 * Create a new options object with the given color.
	 */
	Options.prototype.withColor = function(color) {
	    return this.extend({
	        color: color,
	    });
	};

	/**
	 * Create a new options object with "phantom" set to true.
	 */
	Options.prototype.withPhantom = function() {
	    return this.extend({
	        phantom: true,
	    });
	};

	/**
	 * Create a new options objects with the give font.
	 */
	Options.prototype.withFont = function(font) {
	    return this.extend({
	        font: font,
	    });
	};

	/**
	 * Create a new options object with the same style, size, and color. This is
	 * used so that parent style and size changes are handled correctly.
	 */
	Options.prototype.reset = function() {
	    return this.extend({});
	};

	/**
	 * A map of color names to CSS colors.
	 * TODO(emily): Remove this when we have real macros
	 */
	var colorMap = {
	    "katex-blue": "#6495ed",
	    "katex-orange": "#ffa500",
	    "katex-pink": "#ff00af",
	    "katex-red": "#df0030",
	    "katex-green": "#28ae7b",
	    "katex-gray": "gray",
	    "katex-purple": "#9d38bd",
	    "katex-blueA": "#c7e9f1",
	    "katex-blueB": "#9cdceb",
	    "katex-blueC": "#58c4dd",
	    "katex-blueD": "#29abca",
	    "katex-blueE": "#1c758a",
	    "katex-tealA": "#acead7",
	    "katex-tealB": "#76ddc0",
	    "katex-tealC": "#5cd0b3",
	    "katex-tealD": "#55c1a7",
	    "katex-tealE": "#49a88f",
	    "katex-greenA": "#c9e2ae",
	    "katex-greenB": "#a6cf8c",
	    "katex-greenC": "#83c167",
	    "katex-greenD": "#77b05d",
	    "katex-greenE": "#699c52",
	    "katex-goldA": "#f7c797",
	    "katex-goldB": "#f9b775",
	    "katex-goldC": "#f0ac5f",
	    "katex-goldD": "#e1a158",
	    "katex-goldE": "#c78d46",
	    "katex-redA": "#f7a1a3",
	    "katex-redB": "#ff8080",
	    "katex-redC": "#fc6255",
	    "katex-redD": "#e65a4c",
	    "katex-redE": "#cf5044",
	    "katex-maroonA": "#ecabc1",
	    "katex-maroonB": "#ec92ab",
	    "katex-maroonC": "#c55f73",
	    "katex-maroonD": "#a24d61",
	    "katex-maroonE": "#94424f",
	    "katex-purpleA": "#caa3e8",
	    "katex-purpleB": "#b189c6",
	    "katex-purpleC": "#9a72ac",
	    "katex-purpleD": "#715582",
	    "katex-purpleE": "#644172",
	    "katex-mintA": "#f5f9e8",
	    "katex-mintB": "#edf2df",
	    "katex-mintC": "#e0e5cc",
	    "katex-grayA": "#fdfdfd",
	    "katex-grayB": "#f7f7f7",
	    "katex-grayC": "#eeeeee",
	    "katex-grayD": "#dddddd",
	    "katex-grayE": "#cccccc",
	    "katex-grayF": "#aaaaaa",
	    "katex-grayG": "#999999",
	    "katex-grayH": "#555555",
	    "katex-grayI": "#333333",
	    "katex-kaBlue": "#314453",
	    "katex-kaGreen": "#639b24",
	};

	/**
	 * Gets the CSS color of the current options object, accounting for the
	 * `colorMap`.
	 */
	Options.prototype.getColor = function() {
	    if (this.phantom) {
	        return "transparent";
	    } else {
	        return colorMap[this.color] || this.color;
	    }
	};

	module.exports = Options;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Provides a single function for parsing an expression using a Parser
	 * TODO(emily): Remove this
	 */

	var Parser = __webpack_require__(88);

	/**
	 * Parses an expression using a Parser, then returns the parsed result.
	 */
	var parseTree = function(toParse, settings) {
	    var parser = new Parser(toParse, settings);

	    return parser.parse();
	};

	module.exports = parseTree;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-constant-condition:0 */
	var functions = __webpack_require__(89);
	var environments = __webpack_require__(90);
	var Lexer = __webpack_require__(92);
	var symbols = __webpack_require__(82);
	var utils = __webpack_require__(79);

	var parseData = __webpack_require__(91);
	var ParseError = __webpack_require__(72);

	/**
	 * This file contains the parser used to parse out a TeX expression from the
	 * input. Since TeX isn't context-free, standard parsers don't work particularly
	 * well.
	 *
	 * The strategy of this parser is as such:
	 *
	 * The main functions (the `.parse...` ones) take a position in the current
	 * parse string to parse tokens from. The lexer (found in Lexer.js, stored at
	 * this.lexer) also supports pulling out tokens at arbitrary places. When
	 * individual tokens are needed at a position, the lexer is called to pull out a
	 * token, which is then used.
	 *
	 * The parser has a property called "mode" indicating the mode that
	 * the parser is currently in. Currently it has to be one of "math" or
	 * "text", which denotes whether the current environment is a math-y
	 * one or a text-y one (e.g. inside \text). Currently, this serves to
	 * limit the functions which can be used in text mode.
	 *
	 * The main functions then return an object which contains the useful data that
	 * was parsed at its given point, and a new position at the end of the parsed
	 * data. The main functions can call each other and continue the parsing by
	 * using the returned position as a new starting point.
	 *
	 * There are also extra `.handle...` functions, which pull out some reused
	 * functionality into self-contained functions.
	 *
	 * The earlier functions return ParseNodes.
	 * The later functions (which are called deeper in the parse) sometimes return
	 * ParseFuncOrArgument, which contain a ParseNode as well as some data about
	 * whether the parsed object is a function which is missing some arguments, or a
	 * standalone object which can be used as an argument to another function.
	 */

	/**
	 * Main Parser class
	 */
	function Parser(input, settings) {
	    // Make a new lexer
	    this.lexer = new Lexer(input);
	    // Store the settings for use in parsing
	    this.settings = settings;
	}

	var ParseNode = parseData.ParseNode;

	/**
	 * An initial function (without its arguments), or an argument to a function.
	 * The `result` argument should be a ParseNode.
	 */
	function ParseFuncOrArgument(result, isFunction) {
	    this.result = result;
	    // Is this a function (i.e. is it something defined in functions.js)?
	    this.isFunction = isFunction;
	}

	/**
	 * Checks a result to make sure it has the right type, and throws an
	 * appropriate error otherwise.
	 *
	 * @param {boolean=} consume whether to consume the expected token,
	 *                           defaults to true
	 */
	Parser.prototype.expect = function(text, consume) {
	    if (this.nextToken.text !== text) {
	        throw new ParseError(
	            "Expected '" + text + "', got '" + this.nextToken.text + "'",
	            this.lexer, this.nextToken.position
	        );
	    }
	    if (consume !== false) {
	        this.consume();
	    }
	};

	/**
	 * Considers the current look ahead token as consumed,
	 * and fetches the one after that as the new look ahead.
	 */
	Parser.prototype.consume = function() {
	    this.pos = this.nextToken.position;
	    this.nextToken = this.lexer.lex(this.pos, this.mode);
	};

	/**
	 * Main parsing function, which parses an entire input.
	 *
	 * @return {?Array.<ParseNode>}
	 */
	Parser.prototype.parse = function() {
	    // Try to parse the input
	    this.mode = "math";
	    this.pos = 0;
	    this.nextToken = this.lexer.lex(this.pos, this.mode);
	    var parse = this.parseInput();
	    return parse;
	};

	/**
	 * Parses an entire input tree.
	 */
	Parser.prototype.parseInput = function() {
	    // Parse an expression
	    var expression = this.parseExpression(false);
	    // If we succeeded, make sure there's an EOF at the end
	    this.expect("EOF", false);
	    return expression;
	};

	var endOfExpression = ["}", "\\end", "\\right", "&", "\\\\", "\\cr"];

	/**
	 * Parses an "expression", which is a list of atoms.
	 *
	 * @param {boolean} breakOnInfix Should the parsing stop when we hit infix
	 *                  nodes? This happens when functions have higher precendence
	 *                  than infix nodes in implicit parses.
	 *
	 * @param {?string} breakOnToken The token that the expression should end with,
	 *                  or `null` if something else should end the expression.
	 *
	 * @return {ParseNode}
	 */
	Parser.prototype.parseExpression = function(breakOnInfix, breakOnToken) {
	    var body = [];
	    // Keep adding atoms to the body until we can't parse any more atoms (either
	    // we reached the end, a }, or a \right)
	    while (true) {
	        var lex = this.nextToken;
	        var pos = this.pos;
	        if (endOfExpression.indexOf(lex.text) !== -1) {
	            break;
	        }
	        if (breakOnToken && lex.text === breakOnToken) {
	            break;
	        }
	        var atom = this.parseAtom();
	        if (!atom) {
	            if (!this.settings.throwOnError && lex.text[0] === "\\") {
	                var errorNode = this.handleUnsupportedCmd();
	                body.push(errorNode);

	                pos = lex.position;
	                continue;
	            }

	            break;
	        }
	        if (breakOnInfix && atom.type === "infix") {
	            // rewind so we can parse the infix atom again
	            this.pos = pos;
	            this.nextToken = lex;
	            break;
	        }
	        body.push(atom);
	    }
	    return this.handleInfixNodes(body);
	};

	/**
	 * Rewrites infix operators such as \over with corresponding commands such
	 * as \frac.
	 *
	 * There can only be one infix operator per group.  If there's more than one
	 * then the expression is ambiguous.  This can be resolved by adding {}.
	 *
	 * @returns {Array}
	 */
	Parser.prototype.handleInfixNodes = function(body) {
	    var overIndex = -1;
	    var funcName;

	    for (var i = 0; i < body.length; i++) {
	        var node = body[i];
	        if (node.type === "infix") {
	            if (overIndex !== -1) {
	                throw new ParseError("only one infix operator per group",
	                    this.lexer, -1);
	            }
	            overIndex = i;
	            funcName = node.value.replaceWith;
	        }
	    }

	    if (overIndex !== -1) {
	        var numerNode;
	        var denomNode;

	        var numerBody = body.slice(0, overIndex);
	        var denomBody = body.slice(overIndex + 1);

	        if (numerBody.length === 1 && numerBody[0].type === "ordgroup") {
	            numerNode = numerBody[0];
	        } else {
	            numerNode = new ParseNode("ordgroup", numerBody, this.mode);
	        }

	        if (denomBody.length === 1 && denomBody[0].type === "ordgroup") {
	            denomNode = denomBody[0];
	        } else {
	            denomNode = new ParseNode("ordgroup", denomBody, this.mode);
	        }

	        var value = this.callFunction(
	            funcName, [numerNode, denomNode], null);
	        return [new ParseNode(value.type, value, this.mode)];
	    } else {
	        return body;
	    }
	};

	// The greediness of a superscript or subscript
	var SUPSUB_GREEDINESS = 1;

	/**
	 * Handle a subscript or superscript with nice errors.
	 */
	Parser.prototype.handleSupSubscript = function(name) {
	    var symbol = this.nextToken.text;
	    var symPos = this.pos;
	    this.consume();
	    var group = this.parseGroup();

	    if (!group) {
	        if (!this.settings.throwOnError && this.nextToken.text[0] === "\\") {
	            return this.handleUnsupportedCmd();
	        } else {
	            throw new ParseError(
	                "Expected group after '" + symbol + "'",
	                this.lexer,
	                symPos + 1
	            );
	        }
	    } else if (group.isFunction) {
	        // ^ and _ have a greediness, so handle interactions with functions'
	        // greediness
	        var funcGreediness = functions[group.result].greediness;
	        if (funcGreediness > SUPSUB_GREEDINESS) {
	            return this.parseFunction(group);
	        } else {
	            throw new ParseError(
	                "Got function '" + group.result + "' with no arguments " +
	                    "as " + name,
	                this.lexer, symPos + 1);
	        }
	    } else {
	        return group.result;
	    }
	};

	/**
	 * Converts the textual input of an unsupported command into a text node
	 * contained within a color node whose color is determined by errorColor
	 */
	Parser.prototype.handleUnsupportedCmd = function() {
	    var text = this.nextToken.text;
	    var textordArray = [];

	    for (var i = 0; i < text.length; i++) {
	        textordArray.push(new ParseNode("textord", text[i], "text"));
	    }

	    var textNode = new ParseNode(
	        "text",
	        {
	            body: textordArray,
	            type: "text",
	        },
	        this.mode);

	    var colorNode = new ParseNode(
	        "color",
	        {
	            color: this.settings.errorColor,
	            value: [textNode],
	            type: "color",
	        },
	        this.mode);

	    this.consume();
	    return colorNode;
	};

	/**
	 * Parses a group with optional super/subscripts.
	 *
	 * @return {?ParseNode}
	 */
	Parser.prototype.parseAtom = function() {
	    // The body of an atom is an implicit group, so that things like
	    // \left(x\right)^2 work correctly.
	    var base = this.parseImplicitGroup();

	    // In text mode, we don't have superscripts or subscripts
	    if (this.mode === "text") {
	        return base;
	    }

	    // Note that base may be empty (i.e. null) at this point.

	    var superscript;
	    var subscript;
	    while (true) {
	        // Lex the first token
	        var lex = this.nextToken;

	        if (lex.text === "\\limits" || lex.text === "\\nolimits") {
	            // We got a limit control
	            if (!base || base.type !== "op") {
	                throw new ParseError(
	                    "Limit controls must follow a math operator",
	                    this.lexer, this.pos);
	            } else {
	                var limits = lex.text === "\\limits";
	                base.value.limits = limits;
	                base.value.alwaysHandleSupSub = true;
	            }
	            this.consume();
	        } else if (lex.text === "^") {
	            // We got a superscript start
	            if (superscript) {
	                throw new ParseError(
	                    "Double superscript", this.lexer, this.pos);
	            }
	            superscript = this.handleSupSubscript("superscript");
	        } else if (lex.text === "_") {
	            // We got a subscript start
	            if (subscript) {
	                throw new ParseError(
	                    "Double subscript", this.lexer, this.pos);
	            }
	            subscript = this.handleSupSubscript("subscript");
	        } else if (lex.text === "'") {
	            // We got a prime
	            var prime = new ParseNode("textord", "\\prime", this.mode);

	            // Many primes can be grouped together, so we handle this here
	            var primes = [prime];
	            this.consume();
	            // Keep lexing tokens until we get something that's not a prime
	            while (this.nextToken.text === "'") {
	                // For each one, add another prime to the list
	                primes.push(prime);
	                this.consume();
	            }
	            // Put them into an ordgroup as the superscript
	            superscript = new ParseNode("ordgroup", primes, this.mode);
	        } else {
	            // If it wasn't ^, _, or ', stop parsing super/subscripts
	            break;
	        }
	    }

	    if (superscript || subscript) {
	        // If we got either a superscript or subscript, create a supsub
	        return new ParseNode("supsub", {
	            base: base,
	            sup: superscript,
	            sub: subscript,
	        }, this.mode);
	    } else {
	        // Otherwise return the original body
	        return base;
	    }
	};

	// A list of the size-changing functions, for use in parseImplicitGroup
	var sizeFuncs = [
	    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize",
	    "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge",
	];

	// A list of the style-changing functions, for use in parseImplicitGroup
	var styleFuncs = [
	    "\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle",
	];

	/**
	 * Parses an implicit group, which is a group that starts at the end of a
	 * specified, and ends right before a higher explicit group ends, or at EOL. It
	 * is used for functions that appear to affect the current style, like \Large or
	 * \textrm, where instead of keeping a style we just pretend that there is an
	 * implicit grouping after it until the end of the group. E.g.
	 *   small text {\Large large text} small text again
	 * It is also used for \left and \right to get the correct grouping.
	 *
	 * @return {?ParseNode}
	 */
	Parser.prototype.parseImplicitGroup = function() {
	    var start = this.parseSymbol();

	    if (start == null) {
	        // If we didn't get anything we handle, fall back to parseFunction
	        return this.parseFunction();
	    }

	    var func = start.result;
	    var body;

	    if (func === "\\left") {
	        // If we see a left:
	        // Parse the entire left function (including the delimiter)
	        var left = this.parseFunction(start);
	        // Parse out the implicit body
	        body = this.parseExpression(false);
	        // Check the next token
	        this.expect("\\right", false);
	        var right = this.parseFunction();
	        return new ParseNode("leftright", {
	            body: body,
	            left: left.value.value,
	            right: right.value.value,
	        }, this.mode);
	    } else if (func === "\\begin") {
	        // begin...end is similar to left...right
	        var begin = this.parseFunction(start);
	        var envName = begin.value.name;
	        if (!environments.hasOwnProperty(envName)) {
	            throw new ParseError(
	                "No such environment: " + envName,
	                this.lexer, begin.value.namepos);
	        }
	        // Build the environment object. Arguments and other information will
	        // be made available to the begin and end methods using properties.
	        var env = environments[envName];
	        var args = this.parseArguments("\\begin{" + envName + "}", env);
	        var context = {
	            mode: this.mode,
	            envName: envName,
	            parser: this,
	            lexer: this.lexer,
	            positions: args.pop(),
	        };
	        var result = env.handler(context, args);
	        this.expect("\\end", false);
	        var end = this.parseFunction();
	        if (end.value.name !== envName) {
	            throw new ParseError(
	                "Mismatch: \\begin{" + envName + "} matched " +
	                "by \\end{" + end.value.name + "}",
	                this.lexer /* , end.value.namepos */);
	            // TODO: Add position to the above line and adjust test case,
	            // requires #385 to get merged first
	        }
	        result.position = end.position;
	        return result;
	    } else if (utils.contains(sizeFuncs, func)) {
	        // If we see a sizing function, parse out the implict body
	        body = this.parseExpression(false);
	        return new ParseNode("sizing", {
	            // Figure out what size to use based on the list of functions above
	            size: "size" + (utils.indexOf(sizeFuncs, func) + 1),
	            value: body,
	        }, this.mode);
	    } else if (utils.contains(styleFuncs, func)) {
	        // If we see a styling function, parse out the implict body
	        body = this.parseExpression(true);
	        return new ParseNode("styling", {
	            // Figure out what style to use by pulling out the style from
	            // the function name
	            style: func.slice(1, func.length - 5),
	            value: body,
	        }, this.mode);
	    } else {
	        // Defer to parseFunction if it's not a function we handle
	        return this.parseFunction(start);
	    }
	};

	/**
	 * Parses an entire function, including its base and all of its arguments.
	 * The base might either have been parsed already, in which case
	 * it is provided as an argument, or it's the next group in the input.
	 *
	 * @param {ParseFuncOrArgument=} baseGroup optional as described above
	 * @return {?ParseNode}
	 */
	Parser.prototype.parseFunction = function(baseGroup) {
	    if (!baseGroup) {
	        baseGroup = this.parseGroup();
	    }

	    if (baseGroup) {
	        if (baseGroup.isFunction) {
	            var func = baseGroup.result;
	            var funcData = functions[func];
	            if (this.mode === "text" && !funcData.allowedInText) {
	                throw new ParseError(
	                    "Can't use function '" + func + "' in text mode",
	                    this.lexer, baseGroup.position);
	            }

	            var args = this.parseArguments(func, funcData);
	            var result = this.callFunction(func, args, args.pop());
	            return new ParseNode(result.type, result, this.mode);
	        } else {
	            return baseGroup.result;
	        }
	    } else {
	        return null;
	    }
	};

	/**
	 * Call a function handler with a suitable context and arguments.
	 */
	Parser.prototype.callFunction = function(name, args, positions) {
	    var context = {
	        funcName: name,
	        parser: this,
	        lexer: this.lexer,
	        positions: positions,
	    };
	    return functions[name].handler(context, args);
	};

	/**
	 * Parses the arguments of a function or environment
	 *
	 * @param {string} func  "\name" or "\begin{name}"
	 * @param {{numArgs:number,numOptionalArgs:number|undefined}} funcData
	 * @return the array of arguments, with the list of positions as last element
	 */
	Parser.prototype.parseArguments = function(func, funcData) {
	    var totalArgs = funcData.numArgs + funcData.numOptionalArgs;
	    if (totalArgs === 0) {
	        return [[this.pos]];
	    }

	    var baseGreediness = funcData.greediness;
	    var positions = [this.pos];
	    var args = [];

	    for (var i = 0; i < totalArgs; i++) {
	        var argType = funcData.argTypes && funcData.argTypes[i];
	        var arg;
	        if (i < funcData.numOptionalArgs) {
	            if (argType) {
	                arg = this.parseSpecialGroup(argType, true);
	            } else {
	                arg = this.parseOptionalGroup();
	            }
	            if (!arg) {
	                args.push(null);
	                positions.push(this.pos);
	                continue;
	            }
	        } else {
	            if (argType) {
	                arg = this.parseSpecialGroup(argType);
	            } else {
	                arg = this.parseGroup();
	            }
	            if (!arg) {
	                if (!this.settings.throwOnError &&
	                    this.nextToken.text[0] === "\\") {
	                    arg = new ParseFuncOrArgument(
	                        this.handleUnsupportedCmd(this.nextToken.text),
	                        false);
	                } else {
	                    throw new ParseError(
	                        "Expected group after '" + func + "'",
	                        this.lexer, this.pos);
	                }
	            }
	        }
	        var argNode;
	        if (arg.isFunction) {
	            var argGreediness =
	                functions[arg.result].greediness;
	            if (argGreediness > baseGreediness) {
	                argNode = this.parseFunction(arg);
	            } else {
	                throw new ParseError(
	                    "Got function '" + arg.result + "' as " +
	                    "argument to '" + func + "'",
	                    this.lexer, this.pos - 1);
	            }
	        } else {
	            argNode = arg.result;
	        }
	        args.push(argNode);
	        positions.push(this.pos);
	    }

	    args.push(positions);

	    return args;
	};


	/**
	 * Parses a group when the mode is changing. Takes a position, a new mode, and
	 * an outer mode that is used to parse the outside.
	 *
	 * @return {?ParseFuncOrArgument}
	 */
	Parser.prototype.parseSpecialGroup = function(innerMode, optional) {
	    var outerMode = this.mode;
	    // Handle `original` argTypes
	    if (innerMode === "original") {
	        innerMode = outerMode;
	    }

	    if (innerMode === "color" || innerMode === "size") {
	        // color and size modes are special because they should have braces and
	        // should only lex a single symbol inside
	        var openBrace = this.nextToken;
	        if (optional && openBrace.text !== "[") {
	            // optional arguments should return null if they don't exist
	            return null;
	        }
	        // The call to expect will lex the token after the '{' in inner mode
	        this.mode = innerMode;
	        this.expect(optional ? "[" : "{");
	        var inner = this.nextToken;
	        this.mode = outerMode;
	        var data;
	        if (innerMode === "color") {
	            data = inner.text;
	        } else {
	            data = inner.data;
	        }
	        this.consume(); // consume the token stored in inner
	        this.expect(optional ? "]" : "}");
	        return new ParseFuncOrArgument(
	            new ParseNode(innerMode, data, outerMode),
	            false);
	    } else if (innerMode === "text") {
	        // text mode is special because it should ignore the whitespace before
	        // it
	        var whitespace = this.lexer.lex(this.pos, "whitespace");
	        this.pos = whitespace.position;
	    }

	    // By the time we get here, innerMode is one of "text" or "math".
	    // We switch the mode of the parser, recurse, then restore the old mode.
	    this.mode = innerMode;
	    this.nextToken = this.lexer.lex(this.pos, innerMode);
	    var res;
	    if (optional) {
	        res = this.parseOptionalGroup();
	    } else {
	        res = this.parseGroup();
	    }
	    this.mode = outerMode;
	    this.nextToken = this.lexer.lex(this.pos, outerMode);
	    return res;
	};

	/**
	 * Parses a group, which is either a single nucleus (like "x") or an expression
	 * in braces (like "{x+y}")
	 *
	 * @return {?ParseFuncOrArgument}
	 */
	Parser.prototype.parseGroup = function() {
	    // Try to parse an open brace
	    if (this.nextToken.text === "{") {
	        // If we get a brace, parse an expression
	        this.consume();
	        var expression = this.parseExpression(false);
	        // Make sure we get a close brace
	        this.expect("}");
	        return new ParseFuncOrArgument(
	            new ParseNode("ordgroup", expression, this.mode),
	            false);
	    } else {
	        // Otherwise, just return a nucleus
	        return this.parseSymbol();
	    }
	};

	/**
	 * Parses a group, which is an expression in brackets (like "[x+y]")
	 *
	 * @return {?ParseFuncOrArgument}
	 */
	Parser.prototype.parseOptionalGroup = function() {
	    // Try to parse an open bracket
	    if (this.nextToken.text === "[") {
	        // If we get a brace, parse an expression
	        this.consume();
	        var expression = this.parseExpression(false, "]");
	        // Make sure we get a close bracket
	        this.expect("]");
	        return new ParseFuncOrArgument(
	            new ParseNode("ordgroup", expression, this.mode),
	            false);
	    } else {
	        // Otherwise, return null,
	        return null;
	    }
	};

	/**
	 * Parse a single symbol out of the string. Here, we handle both the functions
	 * we have defined, as well as the single character symbols
	 *
	 * @return {?ParseFuncOrArgument}
	 */
	Parser.prototype.parseSymbol = function() {
	    var nucleus = this.nextToken;

	    if (functions[nucleus.text]) {
	        this.consume();
	        // If there exists a function with this name, we return the function and
	        // say that it is a function.
	        return new ParseFuncOrArgument(
	            nucleus.text,
	            true);
	    } else if (symbols[this.mode][nucleus.text]) {
	        this.consume();
	        // Otherwise if this is a no-argument function, find the type it
	        // corresponds to in the symbols map
	        return new ParseFuncOrArgument(
	            new ParseNode(symbols[this.mode][nucleus.text].group,
	                          nucleus.text, this.mode),
	            false);
	    } else {
	        return null;
	    }
	};

	Parser.prototype.ParseNode = ParseNode;

	module.exports = Parser;


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(79);
	var ParseError = __webpack_require__(72);

	/* This file contains a list of functions that we parse, identified by
	 * the calls to defineFunction.
	 *
	 * The first argument to defineFunction is a single name or a list of names.
	 * All functions named in such a list will share a single implementation.
	 *
	 * Each declared function can have associated properties, which
	 * include the following:
	 *
	 *  - numArgs: The number of arguments the function takes.
	 *             If this is the only property, it can be passed as a number
	 *             instead of an element of a properties object.
	 *  - argTypes: (optional) An array corresponding to each argument of the
	 *              function, giving the type of argument that should be parsed. Its
	 *              length should be equal to `numArgs + numOptionalArgs`. Valid
	 *              types:
	 *               - "size": A size-like thing, such as "1em" or "5ex"
	 *               - "color": An html color, like "#abc" or "blue"
	 *               - "original": The same type as the environment that the
	 *                             function being parsed is in (e.g. used for the
	 *                             bodies of functions like \color where the first
	 *                             argument is special and the second argument is
	 *                             parsed normally)
	 *              Other possible types (probably shouldn't be used)
	 *               - "text": Text-like (e.g. \text)
	 *               - "math": Normal math
	 *              If undefined, this will be treated as an appropriate length
	 *              array of "original" strings
	 *  - greediness: (optional) The greediness of the function to use ungrouped
	 *                arguments.
	 *
	 *                E.g. if you have an expression
	 *                  \sqrt \frac 1 2
	 *                since \frac has greediness=2 vs \sqrt's greediness=1, \frac
	 *                will use the two arguments '1' and '2' as its two arguments,
	 *                then that whole function will be used as the argument to
	 *                \sqrt. On the other hand, the expressions
	 *                  \frac \frac 1 2 3
	 *                and
	 *                  \frac \sqrt 1 2
	 *                will fail because \frac and \frac have equal greediness
	 *                and \sqrt has a lower greediness than \frac respectively. To
	 *                make these parse, we would have to change them to:
	 *                  \frac {\frac 1 2} 3
	 *                and
	 *                  \frac {\sqrt 1} 2
	 *
	 *                The default value is `1`
	 *  - allowedInText: (optional) Whether or not the function is allowed inside
	 *                   text mode (default false)
	 *  - numOptionalArgs: (optional) The number of optional arguments the function
	 *                     should parse. If the optional arguments aren't found,
	 *                     `null` will be passed to the handler in their place.
	 *                     (default 0)
	 *
	 * The last argument is that implementation, the handler for the function(s).
	 * It is called to handle these functions and their arguments.
	 * It receives two arguments:
	 *  - context contains information and references provided by the parser
	 *  - args is an array of arguments obtained from TeX input
	 * The context contains the following properties:
	 *  - funcName: the text (i.e. name) of the function, including \
	 *  - parser: the parser object
	 *  - lexer: the lexer object
	 *  - positions: the positions in the overall string of the function
	 *               and the arguments.
	 * The latter three should only be used to produce error messages.
	 *
	 * The function should return an object with the following keys:
	 *  - type: The type of element that this is. This is then used in
	 *          buildHTML/buildMathML to determine which function
	 *          should be called to build this node into a DOM node
	 * Any other data can be added to the object, which will be passed
	 * in to the function in buildHTML/buildMathML as `group.value`.
	 */

	function defineFunction(names, props, handler) {
	    if (typeof names === "string") {
	        names = [names];
	    }
	    if (typeof props === "number") {
	        props = { numArgs: props };
	    }
	    // Set default values of functions
	    var data = {
	        numArgs: props.numArgs,
	        argTypes: props.argTypes,
	        greediness: (props.greediness === undefined) ? 1 : props.greediness,
	        allowedInText: !!props.allowedInText,
	        numOptionalArgs: props.numOptionalArgs || 0,
	        handler: handler,
	    };
	    for (var i = 0; i < names.length; ++i) {
	        module.exports[names[i]] = data;
	    }
	}

	// A normal square root
	defineFunction("\\sqrt", {
	    numArgs: 1,
	    numOptionalArgs: 1,
	}, function(context, args) {
	    var index = args[0];
	    var body = args[1];
	    return {
	        type: "sqrt",
	        body: body,
	        index: index,
	    };
	});

	// Some non-mathy text
	defineFunction("\\text", {
	    numArgs: 1,
	    argTypes: ["text"],
	    greediness: 2,
	}, function(context, args) {
	    var body = args[0];
	    // Since the corresponding buildHTML/buildMathML function expects a
	    // list of elements, we normalize for different kinds of arguments
	    // TODO(emily): maybe this should be done somewhere else
	    var inner;
	    if (body.type === "ordgroup") {
	        inner = body.value;
	    } else {
	        inner = [body];
	    }

	    return {
	        type: "text",
	        body: inner,
	    };
	});

	// A two-argument custom color
	defineFunction("\\color", {
	    numArgs: 2,
	    allowedInText: true,
	    greediness: 3,
	    argTypes: ["color", "original"],
	}, function(context, args) {
	    var color = args[0];
	    var body = args[1];
	    // Normalize the different kinds of bodies (see \text above)
	    var inner;
	    if (body.type === "ordgroup") {
	        inner = body.value;
	    } else {
	        inner = [body];
	    }

	    return {
	        type: "color",
	        color: color.value,
	        value: inner,
	    };
	});

	// An overline
	defineFunction("\\overline", {
	    numArgs: 1,
	}, function(context, args) {
	    var body = args[0];
	    return {
	        type: "overline",
	        body: body,
	    };
	});

	// An underline
	defineFunction("\\underline", {
	    numArgs: 1,
	}, function(context, args) {
	    var body = args[0];
	    return {
	        type: "underline",
	        body: body,
	    };
	});

	// A box of the width and height
	defineFunction("\\rule", {
	    numArgs: 2,
	    numOptionalArgs: 1,
	    argTypes: ["size", "size", "size"],
	}, function(context, args) {
	    var shift = args[0];
	    var width = args[1];
	    var height = args[2];
	    return {
	        type: "rule",
	        shift: shift && shift.value,
	        width: width.value,
	        height: height.value,
	    };
	});

	// A KaTeX logo
	defineFunction("\\KaTeX", {
	    numArgs: 0,
	}, function(context) {
	    return {
	        type: "katex",
	    };
	});

	defineFunction("\\phantom", {
	    numArgs: 1,
	}, function(context, args) {
	    var body = args[0];
	    var inner;
	    if (body.type === "ordgroup") {
	        inner = body.value;
	    } else {
	        inner = [body];
	    }

	    return {
	        type: "phantom",
	        value: inner,
	    };
	});

	// Extra data needed for the delimiter handler down below
	var delimiterSizes = {
	    "\\bigl" : {type: "open",    size: 1},
	    "\\Bigl" : {type: "open",    size: 2},
	    "\\biggl": {type: "open",    size: 3},
	    "\\Biggl": {type: "open",    size: 4},
	    "\\bigr" : {type: "close",   size: 1},
	    "\\Bigr" : {type: "close",   size: 2},
	    "\\biggr": {type: "close",   size: 3},
	    "\\Biggr": {type: "close",   size: 4},
	    "\\bigm" : {type: "rel",     size: 1},
	    "\\Bigm" : {type: "rel",     size: 2},
	    "\\biggm": {type: "rel",     size: 3},
	    "\\Biggm": {type: "rel",     size: 4},
	    "\\big"  : {type: "textord", size: 1},
	    "\\Big"  : {type: "textord", size: 2},
	    "\\bigg" : {type: "textord", size: 3},
	    "\\Bigg" : {type: "textord", size: 4},
	};

	var delimiters = [
	    "(", ")", "[", "\\lbrack", "]", "\\rbrack",
	    "\\{", "\\lbrace", "\\}", "\\rbrace",
	    "\\lfloor", "\\rfloor", "\\lceil", "\\rceil",
	    "<", ">", "\\langle", "\\rangle", "\\lt", "\\gt",
	    "\\lvert", "\\rvert", "\\lVert", "\\rVert",
	    "\\lgroup", "\\rgroup", "\\lmoustache", "\\rmoustache",
	    "/", "\\backslash",
	    "|", "\\vert", "\\|", "\\Vert",
	    "\\uparrow", "\\Uparrow",
	    "\\downarrow", "\\Downarrow",
	    "\\updownarrow", "\\Updownarrow",
	    ".",
	];

	var fontAliases = {
	    "\\Bbb": "\\mathbb",
	    "\\bold": "\\mathbf",
	    "\\frak": "\\mathfrak",
	};

	// Single-argument color functions
	defineFunction([
	    "\\blue", "\\orange", "\\pink", "\\red",
	    "\\green", "\\gray", "\\purple",
	    "\\blueA", "\\blueB", "\\blueC", "\\blueD", "\\blueE",
	    "\\tealA", "\\tealB", "\\tealC", "\\tealD", "\\tealE",
	    "\\greenA", "\\greenB", "\\greenC", "\\greenD", "\\greenE",
	    "\\goldA", "\\goldB", "\\goldC", "\\goldD", "\\goldE",
	    "\\redA", "\\redB", "\\redC", "\\redD", "\\redE",
	    "\\maroonA", "\\maroonB", "\\maroonC", "\\maroonD", "\\maroonE",
	    "\\purpleA", "\\purpleB", "\\purpleC", "\\purpleD", "\\purpleE",
	    "\\mintA", "\\mintB", "\\mintC",
	    "\\grayA", "\\grayB", "\\grayC", "\\grayD", "\\grayE",
	    "\\grayF", "\\grayG", "\\grayH", "\\grayI",
	    "\\kaBlue", "\\kaGreen",
	], {
	    numArgs: 1,
	    allowedInText: true,
	    greediness: 3,
	}, function(context, args) {
	    var body = args[0];
	    var atoms;
	    if (body.type === "ordgroup") {
	        atoms = body.value;
	    } else {
	        atoms = [body];
	    }

	    return {
	        type: "color",
	        color: "katex-" + context.funcName.slice(1),
	        value: atoms,
	    };
	});

	// There are 2 flags for operators; whether they produce limits in
	// displaystyle, and whether they are symbols and should grow in
	// displaystyle. These four groups cover the four possible choices.

	// No limits, not symbols
	defineFunction([
	    "\\arcsin", "\\arccos", "\\arctan", "\\arg", "\\cos", "\\cosh",
	    "\\cot", "\\coth", "\\csc", "\\deg", "\\dim", "\\exp", "\\hom",
	    "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh",
	    "\\tan", "\\tanh",
	], {
	    numArgs: 0,
	}, function(context) {
	    return {
	        type: "op",
	        limits: false,
	        symbol: false,
	        body: context.funcName,
	    };
	});

	// Limits, not symbols
	defineFunction([
	    "\\det", "\\gcd", "\\inf", "\\lim", "\\liminf", "\\limsup", "\\max",
	    "\\min", "\\Pr", "\\sup",
	], {
	    numArgs: 0,
	}, function(context) {
	    return {
	        type: "op",
	        limits: true,
	        symbol: false,
	        body: context.funcName,
	    };
	});

	// No limits, symbols
	defineFunction([
	    "\\int", "\\iint", "\\iiint", "\\oint",
	], {
	    numArgs: 0,
	}, function(context) {
	    return {
	        type: "op",
	        limits: false,
	        symbol: true,
	        body: context.funcName,
	    };
	});

	// Limits, symbols
	defineFunction([
	    "\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap",
	    "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes",
	    "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint",
	], {
	    numArgs: 0,
	}, function(context) {
	    return {
	        type: "op",
	        limits: true,
	        symbol: true,
	        body: context.funcName,
	    };
	});

	// Fractions
	defineFunction([
	    "\\dfrac", "\\frac", "\\tfrac",
	    "\\dbinom", "\\binom", "\\tbinom",
	], {
	    numArgs: 2,
	    greediness: 2,
	}, function(context, args) {
	    var numer = args[0];
	    var denom = args[1];
	    var hasBarLine;
	    var leftDelim = null;
	    var rightDelim = null;
	    var size = "auto";

	    switch (context.funcName) {
	        case "\\dfrac":
	        case "\\frac":
	        case "\\tfrac":
	            hasBarLine = true;
	            break;
	        case "\\dbinom":
	        case "\\binom":
	        case "\\tbinom":
	            hasBarLine = false;
	            leftDelim = "(";
	            rightDelim = ")";
	            break;
	        default:
	            throw new Error("Unrecognized genfrac command");
	    }

	    switch (context.funcName) {
	        case "\\dfrac":
	        case "\\dbinom":
	            size = "display";
	            break;
	        case "\\tfrac":
	        case "\\tbinom":
	            size = "text";
	            break;
	    }

	    return {
	        type: "genfrac",
	        numer: numer,
	        denom: denom,
	        hasBarLine: hasBarLine,
	        leftDelim: leftDelim,
	        rightDelim: rightDelim,
	        size: size,
	    };
	});

	// Left and right overlap functions
	defineFunction(["\\llap", "\\rlap"], {
	    numArgs: 1,
	    allowedInText: true,
	}, function(context, args) {
	    var body = args[0];
	    return {
	        type: context.funcName.slice(1),
	        body: body,
	    };
	});

	// Delimiter functions
	defineFunction([
	    "\\bigl", "\\Bigl", "\\biggl", "\\Biggl",
	    "\\bigr", "\\Bigr", "\\biggr", "\\Biggr",
	    "\\bigm", "\\Bigm", "\\biggm", "\\Biggm",
	    "\\big",  "\\Big",  "\\bigg",  "\\Bigg",
	    "\\left", "\\right",
	], {
	    numArgs: 1,
	}, function(context, args) {
	    var delim = args[0];
	    if (!utils.contains(delimiters, delim.value)) {
	        throw new ParseError(
	            "Invalid delimiter: '" + delim.value + "' after '" +
	                context.funcName + "'",
	            context.lexer, context.positions[1]);
	    }

	    // \left and \right are caught somewhere in Parser.js, which is
	    // why this data doesn't match what is in buildHTML.
	    if (context.funcName === "\\left" || context.funcName === "\\right") {
	        return {
	            type: "leftright",
	            value: delim.value,
	        };
	    } else {
	        return {
	            type: "delimsizing",
	            size: delimiterSizes[context.funcName].size,
	            delimType: delimiterSizes[context.funcName].type,
	            value: delim.value,
	        };
	    }
	});

	// Sizing functions (handled in Parser.js explicitly, hence no handler)
	defineFunction([
	    "\\tiny", "\\scriptsize", "\\footnotesize", "\\small",
	    "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge",
	], 0, null);

	// Style changing functions (handled in Parser.js explicitly, hence no
	// handler)
	defineFunction([
	    "\\displaystyle", "\\textstyle", "\\scriptstyle",
	    "\\scriptscriptstyle",
	], 0, null);

	defineFunction([
	    // styles
	    "\\mathrm", "\\mathit", "\\mathbf",

	    // families
	    "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf",
	    "\\mathtt",

	    // aliases
	    "\\Bbb", "\\bold", "\\frak",
	], {
	    numArgs: 1,
	    greediness: 2,
	}, function(context, args) {
	    var body = args[0];
	    var func = context.funcName;
	    if (func in fontAliases) {
	        func = fontAliases[func];
	    }
	    return {
	        type: "font",
	        font: func.slice(1),
	        body: body,
	    };
	});

	// Accents
	defineFunction([
	    "\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve",
	    "\\check", "\\hat", "\\vec", "\\dot",
	    // We don't support expanding accents yet
	    // "\\widetilde", "\\widehat"
	], {
	    numArgs: 1,
	}, function(context, args) {
	    var base = args[0];
	    return {
	        type: "accent",
	        accent: context.funcName,
	        base: base,
	    };
	});

	// Infix generalized fractions
	defineFunction(["\\over", "\\choose"], {
	    numArgs: 0,
	}, function(context) {
	    var replaceWith;
	    switch (context.funcName) {
	        case "\\over":
	            replaceWith = "\\frac";
	            break;
	        case "\\choose":
	            replaceWith = "\\binom";
	            break;
	        default:
	            throw new Error("Unrecognized infix genfrac command");
	    }
	    return {
	        type: "infix",
	        replaceWith: replaceWith,
	    };
	});

	// Row breaks for aligned data
	defineFunction(["\\\\", "\\cr"], {
	    numArgs: 0,
	    numOptionalArgs: 1,
	    argTypes: ["size"],
	}, function(context, args) {
	    var size = args[0];
	    return {
	        type: "cr",
	        size: size,
	    };
	});

	// Environment delimiters
	defineFunction(["\\begin", "\\end"], {
	    numArgs: 1,
	    argTypes: ["text"],
	}, function(context, args) {
	    var nameGroup = args[0];
	    if (nameGroup.type !== "ordgroup") {
	        throw new ParseError(
	            "Invalid environment name",
	            context.lexer, context.positions[1]);
	    }
	    var name = "";
	    for (var i = 0; i < nameGroup.value.length; ++i) {
	        name += nameGroup.value[i].value;
	    }
	    return {
	        type: "environment",
	        name: name,
	        namepos: context.positions[1],
	    };
	});


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-constant-condition:0 */
	var fontMetrics = __webpack_require__(80);
	var parseData = __webpack_require__(91);
	var ParseError = __webpack_require__(72);

	var ParseNode = parseData.ParseNode;

	/**
	 * Parse the body of the environment, with rows delimited by \\ and
	 * columns delimited by &, and create a nested list in row-major order
	 * with one group per cell.
	 */
	function parseArray(parser, result) {
	    var row = [];
	    var body = [row];
	    var rowGaps = [];
	    while (true) {
	        var cell = parser.parseExpression(false, null);
	        row.push(new ParseNode("ordgroup", cell, parser.mode));
	        var next = parser.nextToken.text;
	        if (next === "&") {
	            parser.consume();
	        } else if (next === "\\end") {
	            break;
	        } else if (next === "\\\\" || next === "\\cr") {
	            var cr = parser.parseFunction();
	            rowGaps.push(cr.value.size);
	            row = [];
	            body.push(row);
	        } else {
	            // TODO: Clean up the following hack once #385 got merged
	            var pos = Math.min(parser.pos + 1, parser.lexer._input.length);
	            throw new ParseError("Expected & or \\\\ or \\end",
	                                 parser.lexer, pos);
	        }
	    }
	    result.body = body;
	    result.rowGaps = rowGaps;
	    return new ParseNode(result.type, result, parser.mode);
	}

	/*
	 * An environment definition is very similar to a function definition:
	 * it is declared with a name or a list of names, a set of properties
	 * and a handler containing the actual implementation.
	 *
	 * The properties include:
	 *  - numArgs: The number of arguments after the \begin{name} function.
	 *  - argTypes: (optional) Just like for a function
	 *  - allowedInText: (optional) Whether or not the environment is allowed inside
	 *                   text mode (default false) (not enforced yet)
	 *  - numOptionalArgs: (optional) Just like for a function
	 * A bare number instead of that object indicates the numArgs value.
	 *
	 * The handler function will receive two arguments
	 *  - context: information and references provided by the parser
	 *  - args: an array of arguments passed to \begin{name}
	 * The context contains the following properties:
	 *  - envName: the name of the environment, one of the listed names.
	 *  - parser: the parser object
	 *  - lexer: the lexer object
	 *  - positions: the positions associated with these arguments from args.
	 * The handler must return a ParseResult.
	 */

	function defineEnvironment(names, props, handler) {
	    if (typeof names === "string") {
	        names = [names];
	    }
	    if (typeof props === "number") {
	        props = { numArgs: props };
	    }
	    // Set default values of environments
	    var data = {
	        numArgs: props.numArgs || 0,
	        argTypes: props.argTypes,
	        greediness: 1,
	        allowedInText: !!props.allowedInText,
	        numOptionalArgs: props.numOptionalArgs || 0,
	        handler: handler,
	    };
	    for (var i = 0; i < names.length; ++i) {
	        module.exports[names[i]] = data;
	    }
	}

	// Arrays are part of LaTeX, defined in lttab.dtx so its documentation
	// is part of the source2e.pdf file of LaTeX2e source documentation.
	defineEnvironment("array", {
	    numArgs: 1,
	}, function(context, args) {
	    var colalign = args[0];
	    colalign = colalign.value.map ? colalign.value : [colalign];
	    var cols = colalign.map(function(node) {
	        var ca = node.value;
	        if ("lcr".indexOf(ca) !== -1) {
	            return {
	                type: "align",
	                align: ca,
	            };
	        } else if (ca === "|") {
	            return {
	                type: "separator",
	                separator: "|",
	            };
	        }
	        throw new ParseError(
	            "Unknown column alignment: " + node.value,
	            context.lexer, context.positions[1]);
	    });
	    var res = {
	        type: "array",
	        cols: cols,
	        hskipBeforeAndAfter: true, // \@preamble in lttab.dtx
	    };
	    res = parseArray(context.parser, res);
	    return res;
	});

	// The matrix environments of amsmath builds on the array environment
	// of LaTeX, which is discussed above.
	defineEnvironment([
	    "matrix",
	    "pmatrix",
	    "bmatrix",
	    "Bmatrix",
	    "vmatrix",
	    "Vmatrix",
	], {
	}, function(context) {
	    var delimiters = {
	        "matrix": null,
	        "pmatrix": ["(", ")"],
	        "bmatrix": ["[", "]"],
	        "Bmatrix": ["\\{", "\\}"],
	        "vmatrix": ["|", "|"],
	        "Vmatrix": ["\\Vert", "\\Vert"],
	    }[context.envName];
	    var res = {
	        type: "array",
	        hskipBeforeAndAfter: false, // \hskip -\arraycolsep in amsmath
	    };
	    res = parseArray(context.parser, res);
	    if (delimiters) {
	        res = new ParseNode("leftright", {
	            body: [res],
	            left: delimiters[0],
	            right: delimiters[1],
	        }, context.mode);
	    }
	    return res;
	});

	// A cases environment (in amsmath.sty) is almost equivalent to
	// \def\arraystretch{1.2}%
	// \left\{\begin{array}{@{}l@{\quad}l@{}} … \end{array}\right.
	defineEnvironment("cases", {
	}, function(context) {
	    var res = {
	        type: "array",
	        arraystretch: 1.2,
	        cols: [{
	            type: "align",
	            align: "l",
	            pregap: 0,
	            postgap: fontMetrics.metrics.quad,
	        }, {
	            type: "align",
	            align: "l",
	            pregap: 0,
	            postgap: 0,
	        }],
	    };
	    res = parseArray(context.parser, res);
	    res = new ParseNode("leftright", {
	        body: [res],
	        left: "\\{",
	        right: ".",
	    }, context.mode);
	    return res;
	});

	// An aligned environment is like the align* environment
	// except it operates within math mode.
	// Note that we assume \nomallineskiplimit to be zero,
	// so that \strut@ is the same as \strut.
	defineEnvironment("aligned", {
	}, function(context) {
	    var res = {
	        type: "array",
	        cols: [],
	    };
	    res = parseArray(context.parser, res);
	    var emptyGroup = new ParseNode("ordgroup", [], context.mode);
	    var numCols = 0;
	    res.value.body.forEach(function(row) {
	        var i;
	        for (i = 1; i < row.length; i += 2) {
	            row[i].value.unshift(emptyGroup);
	        }
	        if (numCols < row.length) {
	            numCols = row.length;
	        }
	    });
	    for (var i = 0; i < numCols; ++i) {
	        var align = "r";
	        var pregap = 0;
	        if (i % 2 === 1) {
	            align = "l";
	        } else if (i > 0) {
	            pregap = 2; // one \qquad between columns
	        }
	        res.value.cols[i] = {
	            type: "align",
	            align: align,
	            pregap: pregap,
	            postgap: 0,
	        };
	    }
	    return res;
	});


/***/ },
/* 91 */
/***/ function(module, exports) {

	/**
	 * The resulting parse tree nodes of the parse tree.
	 */
	function ParseNode(type, value, mode) {
	    this.type = type;
	    this.value = value;
	    this.mode = mode;
	}

	module.exports = {
	    ParseNode: ParseNode,
	};



/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * The Lexer class handles tokenizing the input in various ways. Since our
	 * parser expects us to be able to backtrack, the lexer allows lexing from any
	 * given starting point.
	 *
	 * Its main exposed function is the `lex` function, which takes a position to
	 * lex from and a type of token to lex. It defers to the appropriate `_innerLex`
	 * function.
	 *
	 * The various `_innerLex` functions perform the actual lexing of different
	 * kinds.
	 */

	var matchAt = __webpack_require__(93);

	var ParseError = __webpack_require__(72);

	// The main lexer class
	function Lexer(input) {
	    this._input = input;
	}

	// The resulting token returned from `lex`.
	function Token(text, data, position) {
	    this.text = text;
	    this.data = data;
	    this.position = position;
	}

	/* The following tokenRegex
	 * - matches typical whitespace (but not NBSP etc.) using its first group
	 * - matches symbol combinations which result in a single output character
	 * - does not match any control character \x00-\x1f except whitespace
	 * - does not match a bare backslash
	 * - matches any ASCII character except those just mentioned
	 * - does not match the BMP private use area \uE000-\uF8FF
	 * - does not match bare surrogate code units
	 * - matches any BMP character except for those just described
	 * - matches any valid Unicode surrogate pair
	 * - matches a backslash followed by one or more letters
	 * - matches a backslash followed by any BMP character, including newline
	 * Just because the Lexer matches something doesn't mean it's valid input:
	 * If there is no matching function or symbol definition, the Parser will
	 * still reject the input.
	 */
	var tokenRegex = new RegExp(
	    "([ \r\n\t]+)|(" +                                // whitespace
	    "---?" +                                          // special combinations
	    "|[!-\\[\\]-\u2027\u202A-\uD7FF\uF900-\uFFFF]" +  // single codepoint
	    "|[\uD800-\uDBFF][\uDC00-\uDFFF]" +               // surrogate pair
	    "|\\\\(?:[a-zA-Z]+|[^\uD800-\uDFFF])" +           // function name
	    ")"
	);

	var whitespaceRegex = /\s*/;

	/**
	 * This function lexes a single normal token. It takes a position and
	 * whether it should completely ignore whitespace or not.
	 */
	Lexer.prototype._innerLex = function(pos, ignoreWhitespace) {
	    var input = this._input;
	    if (pos === input.length) {
	        return new Token("EOF", null, pos);
	    }
	    var match = matchAt(tokenRegex, input, pos);
	    if (match === null) {
	        throw new ParseError(
	            "Unexpected character: '" + input[pos] + "'",
	            this, pos);
	    } else if (match[2]) { // matched non-whitespace
	        return new Token(match[2], null, pos + match[2].length);
	    } else if (ignoreWhitespace) {
	        return this._innerLex(pos + match[1].length, true);
	    } else { // concatenate whitespace to a single space
	        return new Token(" ", null, pos + match[1].length);
	    }
	};

	// A regex to match a CSS color (like #ffffff or BlueViolet)
	var cssColor = /#[a-z0-9]+|[a-z]+/i;

	/**
	 * This function lexes a CSS color.
	 */
	Lexer.prototype._innerLexColor = function(pos) {
	    var input = this._input;

	    // Ignore whitespace
	    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
	    pos += whitespace.length;

	    var match;
	    if ((match = matchAt(cssColor, input, pos))) {
	        // If we look like a color, return a color
	        return new Token(match[0], null, pos + match[0].length);
	    } else {
	        throw new ParseError("Invalid color", this, pos);
	    }
	};

	// A regex to match a dimension. Dimensions look like
	// "1.2em" or ".4pt" or "1 ex"
	var sizeRegex = /(-?)\s*(\d+(?:\.\d*)?|\.\d+)\s*([a-z]{2})/;

	/**
	 * This function lexes a dimension.
	 */
	Lexer.prototype._innerLexSize = function(pos) {
	    var input = this._input;

	    // Ignore whitespace
	    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
	    pos += whitespace.length;

	    var match;
	    if ((match = matchAt(sizeRegex, input, pos))) {
	        var unit = match[3];
	        // We only currently handle "em" and "ex" units
	        if (unit !== "em" && unit !== "ex") {
	            throw new ParseError("Invalid unit: '" + unit + "'", this, pos);
	        }
	        return new Token(match[0], {
	            number: +(match[1] + match[2]),
	            unit: unit,
	        }, pos + match[0].length);
	    }

	    throw new ParseError("Invalid size", this, pos);
	};

	/**
	 * This function lexes a string of whitespace.
	 */
	Lexer.prototype._innerLexWhitespace = function(pos) {
	    var input = this._input;

	    var whitespace = matchAt(whitespaceRegex, input, pos)[0];
	    pos += whitespace.length;

	    return new Token(whitespace[0], null, pos);
	};

	/**
	 * This function lexes a single token starting at `pos` and of the given mode.
	 * Based on the mode, we defer to one of the `_innerLex` functions.
	 */
	Lexer.prototype.lex = function(pos, mode) {
	    if (mode === "math") {
	        return this._innerLex(pos, true);
	    } else if (mode === "text") {
	        return this._innerLex(pos, false);
	    } else if (mode === "color") {
	        return this._innerLexColor(pos);
	    } else if (mode === "size") {
	        return this._innerLexSize(pos);
	    } else if (mode === "whitespace") {
	        return this._innerLexWhitespace(pos);
	    }
	};

	module.exports = Lexer;


/***/ },
/* 93 */
/***/ function(module, exports) {

	/** @flow */

	"use strict";

	function getRelocatable(re) {
	  // In the future, this could use a WeakMap instead of an expando.
	  if (!re.__matchAtRelocatable) {
	    // Disjunctions are the lowest-precedence operator, so we can make any
	    // pattern match the empty string by appending `|()` to it:
	    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-patterns
	    var source = re.source + "|()";

	    // We always make the new regex global.
	    var flags = "g" + (re.ignoreCase ? "i" : "") + (re.multiline ? "m" : "") + (re.unicode ? "u" : "")
	    // sticky (/.../y) doesn't make sense in conjunction with our relocation
	    // logic, so we ignore it here.
	    ;

	    re.__matchAtRelocatable = new RegExp(source, flags);
	  }
	  return re.__matchAtRelocatable;
	}

	function matchAt(re, str, pos) {
	  if (re.global || re.sticky) {
	    throw new Error("matchAt(...): Only non-global regexes are supported");
	  }
	  var reloc = getRelocatable(re);
	  reloc.lastIndex = pos;
	  var match = reloc.exec(str);
	  // Last capturing group is our sentinel that indicates whether the regex
	  // matched at the given location.
	  if (match[match.length - 1] == null) {
	    // Original regex matched.
	    match.length = match.length - 1;
	    return match;
	  } else {
	    return null;
	  }
	}

	module.exports = matchAt;

/***/ },
/* 94 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);