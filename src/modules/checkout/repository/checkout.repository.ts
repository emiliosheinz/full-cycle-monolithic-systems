import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import { CheckoutOrderModel } from "./checkout-order.model";
import { CheckoutProductModel } from "./checkout-product.model";

export default class CheckoutRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    const transaction = await CheckoutOrderModel.sequelize.transaction();
    try {
      await CheckoutOrderModel.create(
        {
          id: order.id.id,
          clientId: order.client.id.id,
          status: order.status,
        },
        { transaction },
      );
      await Promise.all(
        order.products.map(async (product) => {
          await CheckoutProductModel.create(
            {
              id: product.id.id,
              orderId: order.id.id,
              name: product.name,
              salesPrice: product.salesPrice,
              description: product.description,
            },
            { transaction },
          );
        }),
      );
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }
  async findOrder(id: string): Promise<Order | null> {
    const order = await CheckoutOrderModel.findOne({
      where: { id },
      include: { all: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return new Order({
      id: new Id(order.id),
      status: order.status,
      client: new Client({
        id: new Id(order.client.id),
        name: order.client.name,
        email: order.client.email,
        address: order.client.street,
      }),
      products: order.products.map(
        (product) =>
          new Product({
            id: new Id(product.id),
            name: product.name,
            salesPrice: product.salesPrice,
            description: product.description,
          }),
      ),
    });
  }
}
