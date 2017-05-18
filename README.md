# vue-style
A lightweight custom CSS variable plugin for [Vue.js](https://vuejs.org/) 2.0.

## Installation

`npm install vue-style --save`

## Usage

### Using the plugin

```typescript
// Import the module
import VueStyle from "vue-style";

// Initialise the plugin
Vue.use(VueStyle, {
    variables: {
        "primary-bg": "green",
        "font-size": "50px"
    }
});
```

`variables` is an object containing each of the custom variables that you want to use in your CSS. All variables must exist at the beginning of the application, they cannot be added dynamically.

Computed properties can be specified using property getters, in the example below the `primary-fg` property is computed based on the background color being dark or light:

```typescript
Vue.use(VueStyle, {
    variables: {
        "primary-bg": "green",
        get "primary-fg"() {
            return isDark(this["primary-bg"]) ? "white" : "black";
        }
    }
});
```
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
    stylesheet: `body { background: var(--primary-bg); font-size: var(--font-size); }`,
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

Each CSS variable is accessible via the `$style` member that is defined on each Vue component
```typescript
@Component(...) class Example {
    @Lifecycle mounted() {
        this.$style["primary-bg"] = "red";
    }
}
