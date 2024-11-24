import { Router } from "express";
import PlaceOrderUseCase from "../../../modules/checkout/usecase/place-order/place-order.usecase";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";
import ProductAdmFacadeFactory from "../../../modules/product-adm/factory/facade.factory";
import StoreCatalogFacadeFactory from "../../../modules/store-catalog/factory/facade.factory";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";
import PaymentFacadeFactory from "../../../modules/payment/factory/payment.facade.factory";
import { PlaceOrderUseCaseInputDTO } from "../../../modules/checkout/usecase/place-order/place-order.dto";

export const checkoutRoute = Router();

checkoutRoute.post("/", async (req, res) => {
  const clientFacade = ClientAdmFacadeFactory.create();
  const productFacade = ProductAdmFacadeFactory.create();
  const catalogFacade = StoreCatalogFacadeFactory.create();
  const invoiceFacade = InvoiceFacadeFactory.create();
  const paymentFacade = PaymentFacadeFactory.create();
  const placeOrderUseCase = new PlaceOrderUseCase(
    clientFacade,
    productFacade,
    catalogFacade,
    // TODO: emiliosheinz - 2021-08-02 - Implement CheckoutGateway
    null,
    invoiceFacade,
    paymentFacade,
  );
  try {
    const input: PlaceOrderUseCaseInputDTO = {
      clientId: req.body.clientId,
      products: req.body.products.map((p: { productId: string }) => ({
        productId: p.productId,
      })),
    };
    const output = await placeOrderUseCase.execute(input);
    res.status(201).send(output);
  } catch (error) {
    res.status(500).send(error);
  }
});
