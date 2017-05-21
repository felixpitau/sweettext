// index.js
var cheerio = require('cheerio');
var fs = require('fs');

var Sweettext = function () {
	
	this.sweetsFileSource = '.';
	this.sweetDoc = '';
	this.$ = {};
	this.choices = [];
	this.inserts = {};
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
	
	this.addText = function (text) {
		this.log += text + ",";
	};
	
	this.addPrompt = function (prompt, i) {
		this.log += i + ' > ' + prompt + ",";
	};
	
	this.clearPrompts = function () {
		
	};
	
	this.theEnd = function () {
		this.log += 'fin';
	};
	
	this.next = function (elem) {
		if (typeof elem == 'number') {
			elem = this.$(this.choices.get(elem));
		}
		var childrenSet = elem.children('set');
		if (childrenSet.length > 0) {
			for (var i = 0; i < childrenSet.length; i++) {
				var childSet = this.$(childrenSet.get(i));
				var id = childSet.attr("id");
				var value = childSet.attr("value");
				if (value == "true") {
					this.inserts[id] = true;
				} else if (value == "false") {
					this.inserts[id] = false;
				} else {
					this.inserts[id] = value;
				}
			}
		}
		this.clearPrompts();
		if (elem.children('text').length > 0) {
			var formattedContent = this.formatText(elem.children('text').first().html());
			this.addText(formattedContent);
		}
		if (elem.children('s').length > 0) {
			this.next(elem.children('s').first());
		} else {
			if (elem.children('choice').length > 0) {
				this.choices = elem.children('choice');
				for (var i = 0; i <  this.choices.length; i++) {
					var choice = this.$(this.choices.get(i));
					if (choice.attr('prompt') != null) {
						this.addPrompt(choice.attr('prompt'), i);
					} else {
						console.log('Each choice must have a prompt');
					}
				}
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
		if (elem.is('scene')) {
			this.theEnd();
		}
	};
	
	this.load = function (source) {
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
