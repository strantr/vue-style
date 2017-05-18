import Vue from "vue";

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        stylesheet?: string;
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $style: {};
    }
}

export default {
    install(vue: typeof Vue, opts: { variables: { [k: string]: string } }) {
        interface StyleHandler extends Vue {
            readonly isRoot: boolean;
            readonly stylesheet: string;
            readonly computedStyles: {};
            parts: (string | (() => string))[];
        }

        // Flag for if this is the first style handler
        let isRoot = true;

        Object.defineProperty(Vue.prototype, "$style", {
            get(this: Vue) { return this.$root["_style"].variables; }
        });

        // Global store for unique stylesheet instances
        const _instances: { [k: string]: { count: number, component: Vue } } = {};

        // Global store for computed styles
        const _computed = {};

        // StyleHandler component configuration
        const config = {
            computed: {},
            props: ["isRoot", "stylesheet", "computedStyles"],
            data() {
                return { parts: [] };
            },
            created(this: StyleHandler) {
                // The first stylehandler adds watches to each of the computed variables in order to update the backing store
                if (this.isRoot) {
                    Object.keys(this.computedStyles).forEach(k => {
                        this.$watch(() => this.$style[k], (v) => {
                            _computed[k] = v;
                        });
                    });
                }

                const exp = /var\(/g;
                let match: RegExpExecArray | null;
                let pos = 0;
                // Split the stylesheet at each variable
                while ((match = exp.exec(this.stylesheet))) {
                    const m = match;
                    // Previous text can be added as a static section
                    this.parts.push(this.stylesheet.substring(pos, m.index));

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

                    if (!(name in opts.variables)) {
                        throw new Error("Unknown CSS variable name '" + name + "'. Position " + m.index + m[0].length);
                    }

                    if (name in _computed) {
                        this.parts.push(() => this.computedStyles[name]);
                    } else {
                        this.parts.push(() => this[name]);
                    }
                    pos++;
                }

                this.parts.push(this.stylesheet.substr(pos));
            },
            render(this: StyleHandler, h: Vue.CreateElement) {
                let output = "";
                this.parts.forEach(p => {
                    if (typeof p === "string") {
                        output += p;
                    } else {
                        output += p();
                    }
                });

                return h("style", output);
            },
            beforeDestroy(this: StyleHandler) {
                // On destroy if a stylesheet is present then decrease the reference count
                if (this.$options.stylesheet) {
                    let instance = _instances[this.$options.stylesheet];
                    if (--instance.count === 0) {
                        // If no instances remain then destroy the handler
                        instance.component.$destroy();
                        delete _instances[this.$options.stylesheet];
                    }
                }
            }
        };

        // Create base style handler extending Vue
        const StyleHandler = Vue.extend(config);

        // Populate style properties into computed properties
        Object.keys(opts.variables).forEach(k => {
            const descriptor = Object.getOwnPropertyDescriptor(opts.variables, k);
            // If it is a computed property then cache the value
            if (descriptor.get) {
                _computed[k] = opts.variables[k];
            } else {
                // Else create a stub that returns the value from the style object
                config.computed[k] = function (this: Vue) {
                    return this.$style[k];
                };
            }
        });

        Vue.mixin({
            beforeCreate() {
                // If we are the root component then define the reactive style property
                if (this.$root === this) {
                    Vue["util"].defineReactive(this, "_style", opts);
                }

                // If we have been given a stylesheet then check if an instance needs creating
                if (this.$options.stylesheet) {
                    const instance = _instances[this.$options.stylesheet];
                    if (instance) {
                        // Stylesheet already loaded, just increase reference counter
                        instance.count++;
                    } else {
                        // Create a new style handler and append it to the documents head
                        _instances[this.$options.stylesheet] = {
                            count: 1,
                            component: new StyleHandler({
                                propsData: {
                                    isRoot,
                                    computedStyles: _computed,
                                    stylesheet: this.$options.stylesheet
                                }
                            }).$mount(document.head.appendChild(document.createElement("style")))
                        };
                        // Ensure root is false after creation of an instance
                        isRoot = false;
                    }
                }
            }
        });
    }
};