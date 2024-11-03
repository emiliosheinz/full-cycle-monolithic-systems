import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Invoice from "../domain/invoice";
import InvoiceItem from "../domain/invoice-item";
import InvoiceGateway from "../gateway/invoice.gateway";
import InvoiceItemModel from "./invoice-item.model";
import InvoiceModel from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {
  async find(id: string): Promise<Invoice> {
    const invoice = await InvoiceModel.findOne({ where: { id }, include: { all: true } })

    if (!invoice) {
      throw new Error("Invoice not found")
    }

    return new Invoice({
      id: new Id(invoice.id),
      name: invoice.name,
      document: invoice.document,
      address: new Address(
        invoice.street,
        invoice.number,
        invoice.complement,
        invoice.city,
        invoice.state,
        invoice.zipcode,
      ),
      items: invoice.items.map((item) => new InvoiceItem({
        id: new Id(item.id),
        name: item.name,
        price: item.price
      }))
    })
  }

  async generate(invoice: Invoice): Promise<Invoice> {
    const transaction = await InvoiceModel.sequelize.transaction();
    try {
      await InvoiceModel.create({
        id: invoice.id.id,
        name: invoice.name,
        document: invoice.document,
        street: invoice.address.street,
        number: invoice.address.number,
        complement: invoice.address.complement,
        city: invoice.address.city,
        state: invoice.address.state,
        zipcode: invoice.address.zipCode,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      }, { transaction })

      await Promise.all(invoice.items.map(async (item) => {
        await InvoiceItemModel.create({
          id: item.id.id,
          name: item.name,
          price: item.price,
          invoiceId: invoice.id.id,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt
        }, { transaction })
      }))
      return invoice
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
