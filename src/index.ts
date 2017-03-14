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

export const UpdateEventId: string = "vue-style.update";

export const VueStyle = {
    update(vue: Vue, updates: {}) {
        return new Promise(resolve => {
            vue.$root.$emit(UpdateEventId, updates, resolve);
        });
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
                                    stylesheet: this.$options.stylesheet
                                }
                            }).update(opts.defaults).$mount(document.head.appendChild(document.createElement("div"))),
                            count: 1
                        };
                    }
                    if (this === this.$root) {
                        this.$on(UpdateEventId, async (update: {}, callback?: () => void) => {
                            Object.keys(update).forEach(u => {
                                opts.defaults[u] = update[u];
                            });
                            instance.instance.update(update);
                            await instance.instance.$nextTick();
                            if (callback) {
                                callback();
                            }
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