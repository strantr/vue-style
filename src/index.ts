import * as Vue from "vue";
import { StyleHandler } from "./styleHandler";

export interface VueStyleOptions {
    defaults: { [k: string]: string };
    mixins: { [k: string]: (...args: any[]) => string | {} };
}

interface Handler {
    instance: StyleHandler;
    count: number;
}

const instances: {
    [stylesheet: string]: Handler
} = {};

export const VueStyle: Vue.PluginObject<VueStyleOptions> = {
    install(v: typeof Vue, options: VueStyleOptions) {
        let variables: {} = Object.assign({}, options.defaults);
        Vue.mixin({
            beforeCreate() {
                if (this.$options.stylesheet) {
                    let instance: Handler;
                    if (!instances[this.$options.stylesheet]) {
                        instance = {
                            instance: new StyleHandler({
                                propsData: {
                                    variables: variables,
                                    stylesheet: this.$options.stylesheet,
                                }
                            }).$mount(document.head.appendChild(document.createElement("div"))),
                            count: 1
                        };
                    }
                    if (this === this.$root) {
                        this.$on("vue-style.update", (update: {}) => {
                            Object.keys(update).forEach(u => {
                                Vue.set(variables, u, update[u]);
                                instance.instance.update(update);
                            });
                        });
                    }
                }
            },
            beforeDestroy() {
                if (this.$options.stylesheet) {
                    let handler = instances[this.$options.stylesheet];
                    if (--handler.count === 0) {
                        handler.instance.$destroy();
                        delete instances[this.$options.stylesheet];
                    }
                }
            }
        });
    }
};