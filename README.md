# sweettext
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
		<choice prompt="Green">
			<set id="color" value="green"/>
		</choice>
		<choice prompt="Black">
			<set id="color" value="black"/>
		</choice>
		<choice prompt="White">
			<set id="color" value="white"/>
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
var st = require('sweettext');

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
