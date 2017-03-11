import * as Vue from "vue";
import { Component, Render } from "vuety";

@Component()
export class VueStyle extends Vue {
    @Render protected render(h: Vue.CreateElement): Vue.VNode {
        return h("div", "hi");
    }
}
