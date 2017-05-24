<h1 align="center">sweettext</h1>

<p align="center">Sweettext is a simple, custom narration library you can use in CYOA (Choose Your Own Adventure) games.</p>

<p align="center">
[![NPM version](https://badge.fury.io/js/sweettext.svg)](http://badge.fury.io/js/sweettext)
</p>

Useful for writers not proficient in code. This library does not include a graphical interface, you must implement that yourself in something like the command line or an electron app, it's up to you.

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
			<set color="red"/>
		</choice>
		<choice prompt="Blue">
			<set color="blue"/>
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

```

## Features
### Sweets
'sweets' or s/choice tags are used as branches to the story often through choices. Each sweet goes through each of it's children as far as it can before returning and running the next one in order. For example:
```xml
<s>
	<text>
		One
	</text>
	<s>
		<text>
			Two
		</text>
	</s>
</s>
<s>
	<text>
		Three
	</text>
</s>
```
*Output*
```
One
Two
Three
```
Sweets can contain `<choice>`, `<text>`, '<set>', '<add>' and `<s>` but it **cannot** contain `<choice>` and `<s>` at the same time as `<choice>` would be ignored.
#### id & next
You can use the id and next properties to force the next sweet to be that which matches the id of another. However, this may not work as you'd expect. When next is set, it only runs after the children have run to a stop. For example:
```xml
<s next="three">
	<text>
		One
	</text>
	<s>
		<text>
			Two
		</text>
	</s>
</s>
<s>
	<text>
		This is skipped
	</text>
</s>
<s id="three">
	<text>
		Three
	</text>
</s>
```
*Output*
```
One
Two
Three
```

### Choices
Choices display a prompt which a player selects in order to continue. It's contents are the same as that of a sweet and runs like one when selected.
```xml
<choice prompt="Do the thing">
	<text>
		🍋 The thing, the thing!
	</text>
</choice>
```

### Set, Add
`<set>` and `<add>` manipulate values used as inserts in the story. There can only be one `set` and `add` per sweet/choice.
```xml
<set name="lemongrab"/>
<add angerLevel="1"/>
```

### Inserts
Within `<text>` you have inserts where values are placed into the text, there are different kinds. Sets and adds always take place before the text.
#### Simple replacement
```xml
<set dog="Jake" human="Finn"/>
<text>
	v{dog} the dog
	and v{human} the human
</text>
```
*output*
```
Jake the dog
and Finn the human
```
#### Ternary replacement
```xml
<set isHuman="true"/>
<text>
	v{isHuman|Finn|Jake} the v{isHuman|Human|Dog}
</text>
```
*output*
```
Finn the Human
```

## Contributing
Please suggest/make features.

## Planned Features
* Inclusions of more scenes `<include scene="other-scene.xml"/>`
* Inventory management with inventory inserts `i{thing}`
* Conditional sweets `<s if="hasThing is true">`
* Number based inserts `<set val="1"/>` `v{val|zero|one|two|etc}`

## License
MIT License Copyright © 2017 Austin "Felix" Lee
