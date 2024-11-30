import request from "supertest";
import { app } from "../infra/api/express";
import { product } from "./__fixtures__/product";

describe("Products", () => {
  it("should respond with 201 and the created product data", async () => {
    await request(app)
      .post("/products")
      .send(product)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toEqual(expect.any(String));
        expect(body.createdAt).toEqual(expect.any(String));
        expect(body.updatedAt).toEqual(expect.any(String));
        expect(body.name).toEqual(product.name);
        expect(body.description).toEqual(product.description);
        expect(body.stock).toEqual(product.stock);
      });
  });

  it("should respond with 500 when product data is invalid", async () => {
    await request(app)
      .post("/products")
      .send({})
      .set("Accept", "application/json")
      .expect(500);
  });
});
