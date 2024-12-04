import request from "supertest";
import { app, sequelize } from "../infra/api/express";
import { client } from "./__fixtures__/client";
import { product } from "./__fixtures__/product";

beforeAll(async () => {
  await sequelize.sync();
});

describe("Invoice", () => {
  it("should respond with 200 and the found invvoice", async () => {
    const clientResponse = await request(app).post("/clients").send(client);
    const productResponse = await request(app)
      .post("/products")
      .send({
        ...product,
        price: 188,
        stock: 10,
      });
    const checkout = {
      clientId: clientResponse.body.id,
      products: [{ productId: productResponse.body.id }],
    };
    const checkoutResponse = await request(app)
      .post("/checkout")
      .send(checkout);
    await request(app)
      .get(`/invoice/${checkoutResponse.body.invoiceId}`)
      .set("Accept", "application/json")
      .send()
      .expect(({ body }) => {
        expect(body.id).toEqual(expect.any(String));
        expect(body.name).toEqual(client.name);
        expect(body.document).toEqual(client.document);
        expect(body.address).toEqual(expect.any(Object));
        expect(body.items).toEqual([
          {
            id: expect.any(String),
            name: product.name,
            price: 188,
          },
        ]);
        expect(body.total).toEqual(188);
        expect(body.createdAt).toEqual(expect.any(String));
      });
  });

  it("should respond with 500 when there is an error getting the invoice", async () => {
    await request(app)
      .get(`/invoice/invalid-id`)
      .set("Accept", "application/json")
      .send()
      .expect(500);
  });
});
