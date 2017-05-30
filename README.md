<h1 align="center">sweettext</h1>

<h5 align="center">Sweettext is a simple, custom narration library you can use in CYOA (Choose Your Own Adventure) games.</h5>

[![NPM version](https://badge.fury.io/js/sweettext.svg)](http://badge.fury.io/js/sweettext)

This library does not include a graphical interface, you must implement that yourself in something like the command line or an electron app, it's up to you.

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
Sweets can contain `<choice>`, `<text>`, `<set>`, `<add>` and `<s>` but it **cannot** contain `<choice>` and `<s>` at the same time as each `<choice>` would be ignored.

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

#### Conditions
Evaluate values of inserts to determine if a sweet should be skipped or a choice not displayed. Quotes around strings are not necessary.
```xml
<s>
  <set skip="true"/>
</s>
<s if="skip == false">
  <text>
    This will not show
  </text>
</s>
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

### Inclusions
Additional scenes can be included from different scene xml files and accessed using `next` and `id` attributes on sweets and choices. The `.xml` is assumed and optional.
```xml
<include src="adventureTime.xml"/>
<include src="theGreatMushroomWar"/>
```

## Contributing
Please drop in feature suggestions or bug reports to the github repository for this module. I would love to see what people make with this so tweet me [@IAmSyntaxError](https://twitter.com/IAmSyntaxError).

## Planned Features
* Inventory management with inventory inserts `i{thing}`
* Number based inserts `<set val="1"/>` `v{val|zero|one|two|etc}`
* Run scripts on sweets/choices `<script>function doStuff() { console.log('stuff') }</script>`

## License
MIT License Copyright © 2017 Austin "Felix" Lee
