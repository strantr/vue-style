/// <reference path="vue.d.ts" />

import * as Vue from "vue";
import { StyleHandler } from "./styleHandler";

export interface VueStyleOptions {
    defaults: { [k: string]: string };
}

interface Handler {
    instance: StyleHandler;
    count: number;
}

const instances: {
    [stylesheet: string]: Handler
} = {};

export const eventId: string = "vue-style.update";

export const VueStyle: Vue.PluginObject<VueStyleOptions> = {
    update(vue: Vue, updates: {}) {
        vue.$root.$emit(eventId, updates);
    },
    install(v: typeof Vue, options?: VueStyleOptions) {
        let opts: VueStyleOptions = options || { defaults: {} };
        if (!opts.defaults) opts.defaults = {};
        Vue.mixin({
            beforeCreate() {
                if (this.$options.stylesheet) {
                    let instance: Handler;
                    if (!instances[this.$options.stylesheet]) {
                        instance = {
                            instance: new StyleHandler({
                                propsData: {
                                    variables: opts.defaults,
                                    stylesheet: this.$options.stylesheet,
                                }
                            }).$mount(document.head.appendChild(document.createElement("div"))),
                            count: 1
                        };
                    }
                    if (this === this.$root) {
                        this.$on(eventId, (update: {}) => {
                            Object.keys(update).forEach(u => {
                                Vue.set(opts.defaults, u, update[u]);
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