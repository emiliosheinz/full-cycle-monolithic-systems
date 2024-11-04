import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacade from "../../../store-catalog/facade/store-catalog.facade";
import Product from "../../domain/product.entity";
import {
  PlaceOrderUseCaseInputDTO,
  PlaceOrderUseCaseOutputDTO,
} from "./place-order.dto";

export default class PlaceOrderUserCase implements UseCaseInterface {
  private _clientFacade: ClientAdmFacadeInterface;
  private _productFacade: ProductAdmFacadeInterface;
  private _catalogFacade: StoreCatalogFacade;

  constructor(
    clientFacade: ClientAdmFacadeInterface,
    productFacade: ProductAdmFacadeInterface,
    catalogFacade: StoreCatalogFacade,
  ) {
    this._clientFacade = clientFacade;
    this._productFacade = productFacade;
    this._catalogFacade = catalogFacade;
  }

  async execute(
    input: PlaceOrderUseCaseInputDTO,
  ): Promise<PlaceOrderUseCaseOutputDTO> {
    const client = await this._clientFacade.find({ id: input.clientId });

    if (!client) {
      throw new Error("Client not found");
    }

    await this.validateProducts(input);

    return {
      id: "",
      invoiceId: "",
      status: "",
      total: 0,
      products: [],
    };
  }

  private async validateProducts(
    input: PlaceOrderUseCaseInputDTO,
  ): Promise<void> {
    if (!input.products.length) {
      throw new Error("No products selected");
    }

    for (const p of input.products) {
      const product = await this._productFacade.checkStock({
        productId: p.productId,
      });

      if (product.stock <= 0) {
        throw new Error(`Product ${p.productId} is not available in stock`);
      }
    }
  }

  private async getProduct(productId: string): Promise<Product> {
    const product = await this._catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return new Product({
      id: new Id(product.id),
      name: product.name,
      salesPrice: product.salesPrice,
      description: product.description,
    });
  }
}
