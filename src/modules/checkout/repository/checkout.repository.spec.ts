import { Sequelize } from "sequelize-typescript";
import { CheckoutOrderModel } from "./checkout-order.model";
import { CheckoutProductModel } from "./checkout-product.model";
import Order from "../domain/order.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import { ClientModel } from "../../client-adm/repository/client.model";
import Client from "../domain/client.entity";
import Product from "../domain/product.entity";
import CheckoutRepository from "./checkout.repository";

const client = {
  id: "1",
  name: "John Doe",
  email: "john@doe.com",
  document: "1234-567",
  street: "Rua 123",
  number: "99",
  complement: "Green House",
  city: "Criciúma",
  state: "SC",
  zipcode: "88888-888",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Invoice Repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CheckoutOrderModel,
      CheckoutProductModel,
      ClientModel,
    ]);
    await sequelize.sync();

    await ClientModel.create(client);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe("addOrder", () => {
    it("should add an order and its products", async () => {
      const order = new Order({
        id: new Id("123"),
        status: "pending",
        client: new Client({
          id: new Id(client.id),
          name: client.name,
          email: client.email,
          address: client.street,
        }),
        products: [
          new Product({
            id: new Id("1"),
            name: "Product 1",
            price: 100,
            description: "Description 1",
          }),
          new Product({
            id: new Id("2"),
            name: "Product 2",
            price: 100,
            description: "Description 2",
          }),
        ],
      });

      const repository = new CheckoutRepository();
      await repository.addOrder(order);

      const orderDb = await CheckoutOrderModel.findOne({
        where: { id: order.id.id },
        include: { all: true },
      });

      expect(orderDb).toBeDefined();
      expect(orderDb.id).toEqual(order.id.id);
      expect(orderDb.status).toEqual(order.status);
      expect(orderDb.clientId).toEqual(order.client.id.id);
      expect(orderDb.products).toHaveLength(2);
      expect(orderDb.products[0].name).toEqual(order.products[0].name);
      expect(orderDb.products[0].price).toEqual(
        order.products[0].price,
      );
      expect(orderDb.products[0].description).toEqual(
        order.products[0].description,
      );
      expect(orderDb.products[1].name).toEqual(order.products[1].name);
      expect(orderDb.products[1].price).toEqual(
        order.products[1].price,
      );
      expect(orderDb.products[1].description).toEqual(
        order.products[1].description,
      );
    });
  });

  describe("findOrder", () => {
    it("should find an order with its products", async () => {
      const order = await CheckoutOrderModel.create({
        id: "123",
        status: "pending",
        clientId: client.id,
      });
      await CheckoutProductModel.create({
        id: "1",
        orderId: order.id,
        name: "Product 1",
        price: 100,
        description: "Description 1",
      });
      await CheckoutProductModel.create({
        id: "2",
        orderId: order.id,
        name: "Product 2",
        price: 100,
        description: "Description 2",
      });

      const repository = new CheckoutRepository();
      const orderFound = await repository.findOrder(order.id);

      expect(orderFound).toBeDefined();
      expect(orderFound.id.id).toEqual(order.id);
      expect(orderFound.status).toEqual(order.status);
      expect(orderFound.client.id.id).toEqual(client.id);
      expect(orderFound.client.name).toEqual(client.name);
      expect(orderFound.client.email).toEqual(client.email);
      expect(orderFound.client.address).toEqual(client.street);
      expect(orderFound.products).toHaveLength(2);
      expect(orderFound.products[0].id.id).toEqual("1");
      expect(orderFound.products[0].name).toEqual("Product 1");
      expect(orderFound.products[0].price).toEqual(100);
      expect(orderFound.products[0].description).toEqual("Description 1");
      expect(orderFound.products[1].id.id).toEqual("2");
      expect(orderFound.products[1].name).toEqual("Product 2");
      expect(orderFound.products[1].price).toEqual(100);
      expect(orderFound.products[1].description).toEqual("Description 2");
    });

    test("should throw an error when order is not found", async () => {
      const repository = new CheckoutRepository();
      await expect(repository.findOrder("123")).rejects.toThrow(
        "Order not found",
      );
    });
  });
});
