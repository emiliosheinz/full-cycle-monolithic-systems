import express from "express";
import { Sequelize } from "sequelize-typescript";
import { productRoute } from "./routes/product.route";

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
    storage: ":memory:",
    logging: false,
  });
  sequelize.addModels([]);
  await sequelize.sync();
})();
