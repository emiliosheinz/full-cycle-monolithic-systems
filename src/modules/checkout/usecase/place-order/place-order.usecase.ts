import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacade from "../../../store-catalog/facade/store-catalog.facade";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import {
  PlaceOrderUseCaseInputDTO,
  PlaceOrderUseCaseOutputDTO,
} from "./place-order.dto";

export default class PlaceOrderUserCase implements UseCaseInterface {
  private _clientFacade: ClientAdmFacadeInterface;
  private _productFacade: ProductAdmFacadeInterface;
  private _catalogFacade: StoreCatalogFacade;
  private _repository: CheckoutGateway;
  private _invoiceFacade: InvoiceFacadeInterface;
  private _paymentFacade: PaymentFacadeInterface;

  constructor(
    clientFacade: ClientAdmFacadeInterface,
    productFacade: ProductAdmFacadeInterface,
    catalogFacade: StoreCatalogFacade,
    repository: CheckoutGateway,
    invoiceFacade: InvoiceFacadeInterface,
    paymentFacade: PaymentFacadeInterface,
  ) {
    this._clientFacade = clientFacade;
    this._productFacade = productFacade;
    this._catalogFacade = catalogFacade;
    this._repository = repository;
    this._invoiceFacade = invoiceFacade;
    this._paymentFacade = paymentFacade;
  }

  async execute(
    input: PlaceOrderUseCaseInputDTO,
  ): Promise<PlaceOrderUseCaseOutputDTO> {
    const client = await this._clientFacade.find({ id: input.clientId });
    if (!client) {
      throw new Error("Client not found");
    }
    await this.validateProducts(input);
    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId)),
    );

    const myClient = new Client({
      id: new Id(client.id),
      name: client.name,
      email: client.email,
      address: client.street,
    });
    const order = new Order({
      client: myClient,
      products,
    });

    const payment = await this._paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    const invoice =
      payment.status === "approved"
        ? await this._invoiceFacade.generate({
            name: client.name,
            document: client.document,
            street: client.street,
            number: client.number,
            city: client.city,
            complement: client.complement,
            state: client.state,
            zipCode: client.zipCode,
            items: order.products.map((p) => ({
              id: p.id.id,
              name: p.name,
              price: p.salesPrice,
            })),
          })
        : null;

    if (payment.status === "approved") order.approve();
    this._repository.addOrder(order);

    return {
      id: order.id.id,
      invoiceId: payment.status === "approved" ? invoice.id : null,
      status: order.status,
      total: order.total,
      products: order.products.map((p) => ({
        productId: p.id.id,
      })),
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
