import request from "supertest";
import { app } from "../infra/api/express";

describe("Clients", () => {
  it("should respond with 201 and the created client data", async () => {
    const client = {
      name: "John Doe",
      email: "johndoe@example.com",
      document: "123456789",
      address: {
        street: "123 Elm Street",
        number: "45A",
        complement: "Apt 10",
        city: "Some City",
        state: "CA",
        zipCode: "90210",
      },
    };

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
