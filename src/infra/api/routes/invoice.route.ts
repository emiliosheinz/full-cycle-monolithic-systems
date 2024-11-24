import { Router } from "express";
import InvoiceRepository from "../../../modules/invoice/repository/invoice.repository";
import FindInvoiceUseCase from "../../../modules/invoice/usecase/find-invoice/find-invoice.usecase";
import { FindInvoiceUseCaseInputDTO } from "../../../modules/invoice/usecase/find-invoice/find-invoice.dto";

export const invoiceRoute = Router();

invoiceRoute.get("/:id", async (req, res) => {
  const invoiceRepository = new InvoiceRepository();
  const findInvoiceUsecase = new FindInvoiceUseCase(invoiceRepository);
  try {
    const input: FindInvoiceUseCaseInputDTO = { id: req.params.id };
    const output = await findInvoiceUsecase.execute(input);
    res.status(200).send(output);
  } catch (error) {
    res.status(500).send(error);
  }
});
