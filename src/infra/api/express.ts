import express from "express";
import morgan from "morgan";
import { Sequelize } from "sequelize-typescript";
import { productRoute } from "./routes/product.route";
import { clientRoute } from "./routes/client.route";
import { checkoutRoute } from "./routes/checkout.route";
import { invoiceRoute } from "./routes/invoice.route";
import { ProductModel } from "../../modules/product-adm/repository/product.model";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import { CheckoutProductModel } from "../../modules/checkout/repository/checkout-product.model";
import { CheckoutOrderModel } from "../../modules/checkout/repository/checkout-order.model";
import StoreCatalogProductModel from "../../modules/store-catalog/repository/product.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";

export const app = express();
app.use(express.json());

app.use("/products", productRoute);
app.use("/clients", clientRoute);
app.use("/checkout", checkoutRoute);
app.use("/invoice", invoiceRoute);

export let sequelize: Sequelize;
(async () => {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "sqlite.db",
    logging: false,
  });
  sequelize.addModels([
    ClientModel,
    CheckoutOrderModel,
    CheckoutProductModel,
    StoreCatalogProductModel,
    ProductModel,
    TransactionModel,
  ]);
  await sequelize.sync();
})();
