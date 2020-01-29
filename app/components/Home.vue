<template>
    <Page>
        <ActionBar title="In-App Purchase" class="action-bar">
            <ActionItem ios.position="right" text="Restore" @tap="onRestoreTap" />
        </ActionBar>
        <StackLayout>
            <StackLayout v-for="item in Items" :key="item.localizedTitle">
                <GridLayout rows="auto, auto" columns="*, auto" padding="5" @tap="onProductTap(item)">
                    <Label row="0" col="0" :text="item.localizedTitle" textWrap="true" class="item-title" color="black" fontSize="18" />
                    <Label row="1" col="0" :text="item.localizedDescription" textWrap="true" color="rgb(75, 75, 75)" />
                    <Label row="0" rowSpan="2" col="1" :text="item.isPurchased?'Bought':item.priceFormatted" color="black" fontSize="24" />
                </GridLayout>
            </StackLayout>
            <Label v-show="isLoading" text="Loading..." />
            <ActivityIndicator :busy="isLoading" />
            <Label v-show="showGreeting" text="HELLO USER!!" fontSize="40" color="blue" />
            <Image v-show="showPicture" src="https://picsum.photos/300/200" />
        </StackLayout>
    </Page>
</template>

<script>
import * as purchase from "nativescript-purchase";
import * as applicationSettings from "application-settings";
import { Transaction, TransactionState } from "nativescript-purchase/transaction";
import { Product } from "nativescript-purchase/product";
import { ItemEventData } from "ui/list-view";
export default {
    data() {
        return {
            Items: [],
            isLoading: true,
            showGreeting: false,
            showPicture: false,
        }
    },
    created() {
        let that = this
        global.purchaseInitPromise.then(() => {
            purchase.getProducts().then((products) => {
                    products.forEach((product) => {
                        if (applicationSettings.getBoolean(product.productIdentifier)) {
                            console.log("product " + product.productIdentifier + " already purchased")
                            product.isPurchased = true
                            if (product.productIdentifier == 'com.angelengineering.ns6inappbuy.product1') that.showGreeting = true
                            if (product.productIdentifier == 'com.angelengineering.ns6inappbuy.product2') that.showPicture = true
                        }
                    });
                    that.Items = products
                    that.isLoading = false
                })
                .catch((e) => {
                    console.log(e)

                    that.isLoading = true
                });
        })
        purchase.on(purchase.transactionUpdatedEvent, (transaction) => {
            if (transaction.transactionState === TransactionState.Purchased) {
                alert(`Congratulations you purchased ${transaction.productIdentifier}!`);
                console.log(transaction.transactionDate);
                console.log(transaction.transactionIdentifier);
                applicationSettings.setBoolean(transaction.productIdentifier, true);
                that.Items.forEach(item => { if (item.productIdentifier == transaction.productIdentifier) item.isPurchased = true })
                if (transaction.productIdentifier == 'com.angelengineering.ns6inappbuy.product1') that.showGreeting = true
                if (transaction.productIdentifier == 'com.angelengineering.ns6inappbuy.product2') that.showPicture = true
                if (transaction.productIdentifier.indexOf(".consume") >= 0) {//Android only
                    purchase.consumePurchase(transaction.transactionReceipt)
                        .then((responseCode) => console.log(responseCode)) // If responseCode === 0 the purchase has been successfully consumed
                        .catch((e) => console.log(e));
                }
            } else if (transaction.transactionState === TransactionState.Restored) {
                console.log(`Restored purchase of ${transaction.productIdentifier}.`);
                console.log(transaction.transactionDate);
                applicationSettings.setBoolean(transaction.productIdentifier, true);
                that.Items.forEach(item => { if (item.productIdentifier == transaction.productIdentifier) item.isPurchased = true })
                if (transaction.productIdentifier == 'com.angelengineering.ns6inappbuy.product1') that.showGreeting = true
                if (transaction.productIdentifier == 'com.angelengineering.ns6inappbuy.product2') that.showPicture = true
            } else if (transaction.transactionState === TransactionState.Failed) {
                alert(`Purchase of ${transaction.productIdentifier} failed!`);
            }
        });
        //uncomment to restore automatically on app load
        // purchase.restorePurchases();
    },
    methods: {
        onProductTap(data) {
            if (data.isPurchased) {
                console.log("This has already been purchased, ignoring")
                return false
            }
            if (purchase.canMakePayments) {
                console.log("Purchase allowed, purchasing product")
                // NOTE: 'product' must be the same instance as the one returned from getProducts()
                purchase.buyProduct(data);
            } else {
                alert("Sorry, your account is not eligible to make payments!");
            }
        },
        onRestoreTap() {
            console.log("Restoring purchases")
            purchase.restorePurchases();
        },
    },
};
</script>

<style scoped lang="scss">
@import '~@nativescript/theme/scss/variables/blue';
</style>
