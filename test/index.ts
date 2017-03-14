import { expect } from "chai";
import { VueStyle, VueStyleOptions, UpdateEventId } from "../src";
import * as Vue from "vue";
import { Component } from "vuety";

let styles: VueStyleOptions = {
    defaults: {}
};
Vue.use(VueStyle, styles);

function reinsertNode() {
    const child = document.head.lastChild as HTMLElement;
    child.remove();
    document.head.appendChild(child);
}

describe("Component", () => {
    it("Should output styles to page", () => {
        @Component({
            stylesheet: "body {background: rgb(0, 0, 0)}"
        }) class A extends Vue {
        };
        new A().$mount(document.body.appendChild(document.createElement("div")));
        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(0, 0, 0)");
    });

    it("Should interpolate variables", async () => {
        styles.defaults["bg-color"] = "rgb(0, 0, 1)";
        @Component({
            stylesheet: "body {background: -v-bg-color}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(0, 0, 1)");
    });

    it("Should update variables on event", async () => {
        styles.defaults["bg-color"] = "rgb(0, 0, 2)";
        @Component({
            stylesheet: "body {background: -v-bg-color}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        await new Promise(resolve => {
            a.$emit(UpdateEventId, { "bg-color": "rgb(0, 0, 3)" }, () => {
                resolve();
            });
        });

        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content

        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(0, 0, 3)");
    });

    it("Should update variables via function", async () => {
        styles.defaults["bg-color"] = "rgb(0, 0, 4)";
        @Component({
            stylesheet: "body {background: -v-bg-color}"
        }) class A extends Vue {
        };
        const a = new A();
        a.$mount(document.body.appendChild(document.createElement("div")));
        await VueStyle.update(a, { "bg-color": "rgb(0, 0, 5)" });
        reinsertNode(); // Issue with jsdom not recalculating style elements on change of content

        expect(window.getComputedStyle(document.body)["background"]).to.equal("rgb(0, 0, 5)");
    });
});