/// <reference path="../src/vue.d.ts" />

import * as Vue from "vue";
import { Component } from "vuety";
import { VueStyle } from "../src";

const el = document.createElement("div");
document.body.appendChild(el);

Vue.use(VueStyle, {
    mixins: {
        colors(this: {}, basis: string) {
            console.log(this);
            return "background: " + this[basis + "-bg"] + "; color: white;";
        }
    },
    defaults: {
        "primary-bg": "green",
        "font-size": "50px"
    }
});

@Component({
    stylesheet: require("./style.vcss"),
    template: `
        <div>Hello World</div>
    `
    , mounted() {
        setTimeout(() => this.$emit("vue-style.update", { "font-size": "10px", "primary-bg": "red" }), 1000);
    }
})
class MyComponent extends Vue {
}

new MyComponent().$mount(el);