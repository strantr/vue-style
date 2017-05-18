import { expect } from "chai";
import VueStyle from "../src";
import Vue from "vue";
import { Component } from "vuety";

const styles = {
    variables: {
        "bg-color": "unset",
        get "fg-color"(this: {}) {
            return "rgb(" + this["bg-color"].substring(4).split("").reverse().join("").substr(1) + ")";
        }
    }
};
Vue.use(VueStyle, styles);

function reinsertNode() {
    const child = document.head.lastChild as HTMLElement;
    child.remove();
    document.head.appendChild(child);
}

describe("Component", () => {
    it("Should output styles to page", async () => {
        @Component({
            stylesheet: "body {background: rgb(1, 2, 3)}"
        }) class A extends Vue {
        };
        new A().$mount(document.body.appendChild(document.createElement("div")));
        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(1, 2, 3)");
    });

    it("Should interpolate variables", async () => {
        styles.variables["bg-color"] = "rgb(4, 5, 6)";
        @Component({
            stylesheet: "body {background: var(--bg-color)}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        await a.$nextTick();
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content
        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(4, 5, 6)");
    });

    it("Should update variables", async () => {
        styles.variables["bg-color"] = "rgb(7, 8, 9)";
        @Component({
            stylesheet: "body {background: var(--bg-color)}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        a.$style["bg-color"] = "rgb(10, 11, 12)";
        await a.$nextTick();
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content
        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(10, 11, 12)");
    });

    it("Should allow computed variables", async () => {
        styles.variables["bg-color"] = "rgb(13, 14, 15)";
        @Component({
            stylesheet: "body {color: var(--fg-color)}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        await a.$nextTick();
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content
        expect(window.getComputedStyle(document.body)["color"]).to.equal("rgb(51, 41, 31)");
    });

    it("Should recompute computed variables", async () => {
        styles.variables["bg-color"] = "rgb(16, 17, 18)";
        @Component({
            stylesheet: "body {color: var(--fg-color)}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        await a.$nextTick();
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content
        expect(window.getComputedStyle(document.body)["color"]).to.equal("rgb(81, 71, 61)");

        styles.variables["bg-color"] = "rgb(19, 20, 21)";
        await a.$nextTick();
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content
        expect(window.getComputedStyle(document.body)["color"]).to.equal("rgb(12, 2, 91)");
    });
});