import { Router } from "express";
import AddProductUseCase from "../../../modules/product-adm/usecase/add-product/add-product.usecase";
import ProductRepository from "../../../modules/product-adm/repository/product.repository";
import { AddProductInputDto } from "../../../modules/product-adm/usecase/add-product/add-product.dto";

export const productRoute = Router();

productRoute.post("/", async (req, res) => {
  const productRepository = new ProductRepository();
  const addProductUsecase = new AddProductUseCase(productRepository);
  try {
    const input: AddProductInputDto = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    };
    const output = await addProductUsecase.execute(input);
    res.status(201).send(output);
  } catch (error) {
    res.status(500).send(error);
  }
});
