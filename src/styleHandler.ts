import Vue from "vue";
import { Component, Lifecycle, Prop, Render } from "vuety";

@Component() export class StyleHandler extends Vue {
    // The previously rendered styles
    private _rendered: string | undefined;
    // Each section that must be joined in order to generate the stylesheet
    private _parts: (string | (() => string))[];
    // Fields that trigger an update of the component
    private _bindings: string[];
    // Current variable values
    private _variables: {};

    @Prop protected stylesheet: string;

    @Lifecycle protected created() {
        this._parts = [];
        this._bindings = [];
        const exp = /var\(/g;
        let match: RegExpExecArray | null;
        let pos = 0;
        // Split the stylesheet at each variable
        while ((match = exp.exec(this.stylesheet))) {
            const m = match;
            // Previous text can be added as a static section
            this._parts.push(this.stylesheet.substring(pos, m.index));

            pos = m.index + m[0].length;

            // Find closing parenthesis
            let depth = 1;
            for (; pos < this.stylesheet.length; pos++) {
                if (this.stylesheet[pos] === "(") {
                    depth++;
                }
                else if (this.stylesheet[pos] === ")" && --depth === 0) {
                    break;
                }
            }

            if (depth > 0) {
                throw new Error("Unable to parse CSS variable reference. Position " + m.index);
            }

            // Parse name, ensure it matches the spec --name
            // TODO: Allow for custom functions here
            let name = this.stylesheet.substring(m.index + m[0].length, pos);
            if (!name.startsWith("--")) {
                throw new Error("Invalid CSS variable name '" + name + "'. Position " + m.index + m[0].length);
            }

            name = name.substr(2);

            this._parts.push(() => this._variables[name] || (console.warn("Unknown variable " + name), "unset"));
            this._bindings.push(name);
            pos++;
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