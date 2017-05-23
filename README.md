# sweettext

[![NPM version](https://badge.fury.io/js/sweettext.svg)](http://badge.fury.io/js/sweettext)

Sweettext is a simple, custom narration library you can use in CYOA (Choose Your Own Adventure) games. Useful for writers not proficient in code.

## Installation
```javascript
$ npm install sweettext
```

## Basic Usage

*narrative.xml*
```xml
<scene>
	<s>
		<text>
			Which color do you prefer?
		</text>
		<choice prompt="Red">
			<set id="color" value="red"/>
		</choice>
		<choice prompt="Blue">
			<set id="color" value="blue"/>
		</choice>
		<s>
			<text>
				You prefer the color v{color}!
			</text>
		</s>
	</s>
</scene>
```

*index.js*
```javascript
const st = require('sweettext')

// Override onAddText
st.onAddText = function (text) {
	// TODO: Display text
}

// Override onAddChoice
st.onAddChoice = function (choice, i) {
	// TODO: Display choice
}

// Override
st.onAddChoiceListeners = function () {
	// TODO: Make a click/touch listener for each choice button and run st.next(i)
}

// Override onClearChoices
st.onClearChoices = function () {
	// TODO: Empty choice display, ready for new choices
}

// Override onFinish
st.onFinish = function () {
	// TODO: Display "THE END"
}

// Load from xml file
st.load(__dirname + '/narrative.xml');

// Graphical implementation ...
```

## Planned Features
* Inventory management with inventory inserts `i{thing}`
* Conditional sweets `<s if="hasThing is true">`
* Number based inserts `<set id="val" value="1"/>` `v{val|zero|one|two|etc}`

## License
MIT License Copyright © 2017 Austin "Felix" Lee
