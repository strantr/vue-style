import { VueStyle } from "../src";
{
    const el = document.createElement("div");
    document.body.appendChild(el);
    new VueStyle().$mount(el);
}