import { Router } from "express";
import ClientRepository from "../../../modules/client-adm/repository/client.repository";
import AddClientUseCase from "../../../modules/client-adm/usecase/add-client/add-client.usecase";
import { AddClientInputDto } from "../../../modules/client-adm/usecase/add-client/add-client.usecase.dto";
import Address from "../../../modules/@shared/domain/value-object/address";

export const clientRoute = Router();

clientRoute.post("/", async (req, res) => {
  const clientRepository = new ClientRepository();
  const addClientUsecase = new AddClientUseCase(clientRepository);
  try {
    const input: AddClientInputDto = {
      name: req.body.name,
      email: req.body.email,
      document: req.body.document,
      address: new Address(
        req.body.address.street,
        req.body.address.number,
        req.body.address.complement,
        req.body.address.city,
        req.body.address.state,
        req.body.address.zipCode,
      ),
    };
    const output = await addClientUsecase.execute(input);
    res.status(201).send(output);
  } catch (error) {
    res.status(500).send(error);
  }
});
