import * as Vue from "vue";
import { Component, Lifecycle, Prop, Render } from "vuety";

@Component() export class StyleHandler extends Vue {
    private _rendered: string | undefined;
    private _parts: (string | (() => string))[];
    private _bindings: string[];
    private _variables: {};

    @Prop protected stylesheet: string;

    @Lifecycle protected created() {
        this._parts = [];
        this._bindings = [];
        let exp = /:\s*-v-([\w-]+)/g;
        let match: RegExpExecArray | null;
        let pos = 0;
        while ((match = exp.exec(this.stylesheet))) {
            const m = match;
            this._parts.push(this.stylesheet.substring(pos, m.index) + ":");
            this._parts.push(() => this._variables[m[1]] || (console.warn("Unknown variable " + m[1]), "unset"));
            pos = m.index + m[0].length;
            this._bindings.push(m[1]);
        }
        this._parts.push(this.stylesheet.substr(pos));
        this.$forceUpdate();
    }

    @Render protected render(h: Vue.CreateElement): Vue.VNode {
        if (!this._rendered) {
            let v = "";
            this._parts.forEach(p => {
                if (typeof p === "string") {
                    v += p;
                } else {
                    v += p() || "unset";
                }
            });
            this._rendered = v;
        }
        return h("style", this._rendered);
    }

    public update(variables: {}) {
        let render = false;
        Object.keys(variables).forEach(v => {
            if (this._bindings.indexOf(v) > -1) {
                this._rendered = undefined;
                render = true;
            }
        });
        this._variables = Object.assign(this._variables || {}, variables);
        if (render) {
            this.$forceUpdate();
        }
        return this;
    }
}