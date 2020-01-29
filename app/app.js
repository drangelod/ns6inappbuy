import Vue from "nativescript-vue";
import Home from "./components/Home";
import * as purchase from "nativescript-purchase";

Vue.config.silent = true;
global.purchaseInitPromise = purchase.init([
    "com.angelengineering.ns6inappbuy.product1",
    "com.angelengineering.ns6inappbuy.product2"
]);

new Vue({
    template: `
        <Frame>
            <Home />
        </Frame>`,
    components: {
        Home
    }
}).$start();
