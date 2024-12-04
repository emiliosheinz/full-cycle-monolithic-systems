import request from "supertest";
import { app, sequelize } from "../infra/api/express";
import { client } from "./__fixtures__/client";

beforeAll(async () => {
  await sequelize.sync();
});

describe("Clients", () => {
  it("should respond with 201 and the created client data", async () => {
    await request(app)
      .post("/clients")
      .send(client)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toEqual(expect.any(String));
        expect(body.createdAt).toEqual(expect.any(String));
        expect(body.updatedAt).toEqual(expect.any(String));
        expect(body.name).toEqual(client.name);
        expect(body.email).toEqual(client.email);
        expect(body.document).toEqual(client.document);
        expect(body.address).toEqual(expect.any(Object));
      });
  });

  it("should respond with 500 when client data is invalid", async () => {
    await request(app)
      .post("/clients")
      .send({})
      .set("Accept", "application/json")
      .expect(500);
  });
});
