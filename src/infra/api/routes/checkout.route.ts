import { Router } from "express";
import { PlaceOrderUseCaseInputDTO } from "../../../modules/checkout/usecase/place-order/place-order.dto";
import CheckoutPlaceOrderUsecaseFactory from "../../../modules/checkout/factory/checkout-place-order.usecase.factory";

export const checkoutRoute = Router();

checkoutRoute.post("/", async (req, res) => {
  const placeOrderUseCase = CheckoutPlaceOrderUsecaseFactory.create();
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
    console.log(error);
    res.status(500).send(error);
  }
});
