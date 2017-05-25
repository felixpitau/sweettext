// index.js
var cheerio = require('cheerio');
var fs = require('fs');

var Sweettext = function () {
	
	this.sweetsFileSource = '.';
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
					console.error('Only boolean, string and number types allowed as values');
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
					parts[i] = "'" + parsed + "'";
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
			this.choices = null;
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
				this.goto = this.$('s#' + elem.attr('next')).first();
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
						console.log('Each choice must have a prompt');
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
	
	this.load = function (source) {
		this.sweetsFileSource = '.';
		this.sweetDoc = '';
		this.$ = {};
		this.choices = [];
		this.sweetDoc = fs.readFileSync(source);
		this.$ = cheerio.load(this.sweetDoc, {
	    withDomLvl1: true,
	    normalizeWhitespace: true,
	    xmlMode: true,
	    decodeEntities: true
		});
		this.next(this.$('s').first());
	};
};

module.exports = new Sweettext();
