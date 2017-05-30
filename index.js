// index.js
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

var Sweettext = function () {
	
	this.sweetDoc = '';
	this.$ = {};
	this.choices = [];
	this.inserts = {};
	this.goto = null;
	this.log = 'start,';
	
	this.formatText = function (text) {
		if (typeof text == 'string') {
			text = text.trim();
			var valueReg = new RegExp(/v\{([\w\-])+(\|?[\w\s\.\,\:\;\-\!\?]*)(\|?[\w\s\.\,\:\;\-\!\?]*)\}/g);
			var replaceReg = new RegExp(/v\{([\w\-])+(\|?[\w\s\.\,\:\;\-\!\?]*)(\|?[\w\s\.\,\:\;\-\!\?]*)\}/);
			var inserts = text.match(valueReg);
			if (inserts == null) return text;
			for (var i = 0; i < inserts.length; i++) {
				var insert = inserts[i];
				var insertData = insert.replace(/(v\{|\})/g, "").split(/\|/g);
				var valueItem = this.inserts[insertData[0]];
				if (typeof valueItem == 'boolean') {
					if (insertData[1] != null) {
						if (insertData[2] != null) {
							text = text.replace(replaceReg, this.inserts[insertData[0]] ? insertData[1] : insertData[2]);
						} else {
							text = text.replace(replaceReg, this.inserts[insertData[0]] ? insertData[1] : "");
						}
					}
				} else if (typeof valueItem == 'object') {
					console.error('[sweettext] Only boolean, string and number types allowed as values');
					text = text.replace(replaceReg, "");
				} else {
					text = text.replace(replaceReg, valueItem);
				}
			}
			return text;
		}
	};
	
	this.onAddText = function (text) {
		this.log += text + ",";
	};
	
	this.onAddChoice = function (prompt, i) {
		this.log += i + ' > ' + prompt + ",";
	};
	
	this.onClearChoices = function () {
		
	};
	
	this.onAddChoiceListeners = function () {
		
	};
	
	this.onEval = function (statement) {
		return new Function (statement);
	};
	
	this.onFinish = function () {
		this.log += 'fin';
	};
	
	this.parseStatement = function (statement) {
		var parts = statement.split(/\s/g);
		for (var i = 0; i < parts.length; i++) {
			if (!parts[i].match(/(\=\=|\!\=|\<|\>|\>\=|\<\=|\&\&|\|\|)/)) {
				for (var insert in this.inserts) {
					if (insert == parts[i]) {
						parts[i] = this.inserts[insert];
						break;
					}
				}
				var parsed = this.parseValue(parts[i]);
				if (typeof parsed == 'string') {
					if ((parsed.slice(1) == '\'' && parsed.slice(-1) == '\'') ||
							(parsed.slice(1) == '"' && parsed.slice(-1) == '"')) {
						parts[i] = parsed;
					} else {
						parts[i] = "'" + parsed + "'";
					}
				} else {
					parts[i] = parsed;
				}
			}
		}
		return (new Function('return ' + parts.join(' ')))();
	};
	
	this.parseValue = function (value) {
		if (value == 'true' || value == 'false') {
			return (value == 'true');
		} else if (!isNaN(value)) {
			return parseInt(value, 10);
		} else {
			return value;
		}
	};
	
	this.next = function (elem) {
		if (typeof elem == 'number') {
			elem = this.$(this.choices.get(elem));
			this.choices = [];
		}
		
		var skip = false;
		if (elem.attr('if') != null) {
			skip = !this.parseStatement(elem.attr('if'));
		}
		
		if (!skip) {
			
			if (elem.children('set').length > 0) {
				var attribs = elem.children('set')[0].attribs;
				for (var attr in attribs) {
					this.inserts[attr] = this.parseValue(attribs[attr]);
				}
			}
			
			if (elem.children('add').length > 0) {
				var attribs = elem.children('add')[0].attribs;
				for (var attr in attribs) {
					if (this.inserts[attr] == null) {
						this.inserts[attr] = this.parseValue(attribs[attr]);
					} else {
						this.inserts[attr] += this.parseValue(attribs[attr]);
					}
				}
			}
			
			if (elem.attr('next') != null) {
				if (this.$('s#' + elem.attr('next')).length > 0) {
					this.goto = this.$('s#' + elem.attr('next')).first();
				} else {
					console.error('[sweettext] Could not find the next sweet with id ' + elem.attr('next'));
					this.onFinish();
					return;
				}
			}
			this.onClearChoices();
			if (elem.children('text').length > 0) {
				var formattedContent = this.formatText(elem.children('text').first().html());
				this.onAddText(formattedContent);
			}
		}
		
		if (elem.children('s').length > 0 && !skip) {
			this.next(elem.children('s').first());
		} else {
			if (elem.children('choice').length > 0 && !skip) {
				this.choices = elem.children('choice');
				for (var i = 0; i <  this.choices.length; i++) {
					var choice = this.$(this.choices.get(i));
					if (choice.attr('prompt') != null) {
						if (choice.attr('if') == null || this.parseStatement(choice.attr('if'))) {
							this.onAddChoice(choice.attr('prompt'), i);
						}
					} else {
						console.error('[sweettext] Choice does not have prompt');
					}
				}
				this.onAddChoiceListeners();
			} else {
				if (this.goto != null) {
					var goto = this.goto;
					this.goto = null;
					this.next(goto);
				} else {
					var nextElem = elem;
					while (nextElem.is('choice') || nextElem.is(':last-child')) {
						nextElem = nextElem.parent();
						if (nextElem.is('scene'))
							break;
					}
					if (nextElem.is('scene')){
						elem = nextElem;
					} else {
						this.next(nextElem.next('s'));
					}
				}
			}
		}
		
		if (elem.is('scene')) {
			this.onFinish();
		}
	};
	
	this.load = function (loadPath) {
		this.choices = [];
		if (loadPath.slice(-4) != '.xml') loadPath += '.xml';
		this.sweetDoc = fs.readFileSync(loadPath);
		var cheerioSettings = {
	    withDomLvl1: true,
	    normalizeWhitespace: true,
	    xmlMode: true,
	    decodeEntities: true
		};
		this.$ = cheerio.load(this.sweetDoc, cheerioSettings);
		while (this.$('include').length > 0) {
			for (var i = 0; i < this.$('include').length; i++) {
				var include = this.$(this.$('include')[i]);
				var src = include.attr('src');
				if (src.slice(-4) != '.xml') src += '.xml';
				var parPath = include.parent().attr('src') != null ? include.parent().attr('src') : loadPath;
				var incPath = path.join(path.dirname(parPath), src);
				if (include.attr('src') != null) {
					var c = cheerio.load(fs.readFileSync(incPath), cheerioSettings);
					c('scene').first().attr('src', incPath);
					include.parent().after(c.html());
				}
				this.$(this.$('include')[i]).remove();
			}
		}
		this.next(this.$('s').first());
	};
};

module.exports = new Sweettext();
