import * as Vue from "vue";

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        stylesheet?: string;
    }
}