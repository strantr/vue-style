# vue-style
A lightweight custom CSS variable plugin for [Vue.js](https://vuejs.org/) 2.0. 

## Installation

`npm install vue-style --save`

## Usage

### Importing the plugin

Import the module (e.g. `import { VueStyle } from "vue-style"`) and then call:

```typescript
Vue.use(VueStyle, {
    variables: {
        "primary-bg": "green",
        "font-size": "50px"
    }
});
```

Where variables is an object containing each of the variables that you want to use in your CSS.

### Creating a stylesheet

You write a standard stylesheet (css, scss, less, etc.) and use `var(--variable-name)` where a variable should be interpolated, e.g. `var(--primary-bg)` would return `green` from the variables above.

An example stylesheet using the variables in the example shown above:
```css
body {
    font-size: var(--font-size);
    background: var(--primary-bg);
}
```
Giving a font size of 50px and a background color of green.

### Using the stylesheet

The stylesheet should be passed to the component using via the `component.$options` object, for example, using [Vuety](https://github.com/strantr/vuety):
```typescript
// Load via require e.g. webpack
@Component({
    stylesheet: require("./style.vcss"),
})
class MyComponent extends Vue {
    ...
}

// Inline stylesheet
@Component({
    stylesheet: `body { background: -v-primary-bg; font-size: -v-font-size; }`,
})
class MyComponent extends Vue {
    ...
}
```
The stylesheet will be injected into the page on the creation of the first instance of this component.

#### Webpack
When using webpack to load the stylesheet you will need to load your stylesheets using `raw-loader`.
The example above shows requiring style.vcss, an example loader using sass would be:
```typescript
{
    test: /\.vcss$/,
    loaders: ["raw-loader", "sass-loader"]
}
```

### Updating variables

The style variables can be updated via raising an event on the root component:
```typescript
import { UpdateEventId } from "vue-style";
...
this.$root.$emit(UpdateEventId, { "font-size": "10px", "primary-bg": "red" });
```
or by calling the update function
```typescript
import { VueStyle } from "vue-style";
...
/*Where this is a Vue component*/
VueStyle.update(this, { "font-size": "10px", "primary-bg": "red" });
```