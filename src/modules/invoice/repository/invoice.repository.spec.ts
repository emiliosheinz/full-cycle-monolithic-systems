
import { Sequelize } from "sequelize-typescript"
import InvoiceModel from "./invoice.model"
import InvoiceItemModel from "./invoice-item.model"
import InvoiceRepository from "./invoice.repository"
import Invoice from "../domain/invoice"
import Address from "../../@shared/domain/value-object/address"
import InvoiceItem from "../domain/invoice-item"

describe("Invoice Repository test", () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true }
    })

    sequelize.addModels([InvoiceModel, InvoiceItemModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it("should generate an invoice and its items", async () => {
    const invoice = new Invoice({
      name: 'John Doe',
      document: '1234-5678',
      address: new Address(
        'Rua 123',
        '99',
        'Green House',
        'Criciúma',
        'SC',
        '88888-888'
      ),
      items: [
        new InvoiceItem({
          name: 'Item 1',
          price: 100
        }),
        new InvoiceItem({
          name: 'Item 2',
          price: 200
        })
      ]
    })

    const repository = new InvoiceRepository()
    await repository.generate(invoice)

    const invoiceDb = await InvoiceModel.findOne({ where: { id: invoice.id.id }, include: { all: true } })

    expect(invoiceDb).toBeDefined()
    expect(invoiceDb.id).toEqual(invoice.id.id)
    expect(invoiceDb.name).toEqual(invoice.name)
    expect(invoiceDb.document).toEqual(invoice.document)
    expect(invoiceDb.street).toEqual(invoice.address.street)
    expect(invoiceDb.number).toEqual(invoice.address.number)
    expect(invoiceDb.complement).toEqual(invoice.address.complement)
    expect(invoiceDb.city).toEqual(invoice.address.city)
    expect(invoiceDb.state).toEqual(invoice.address.state)
    expect(invoiceDb.zipcode).toEqual(invoice.address.zipCode)
    expect(invoiceDb.createdAt).toStrictEqual(invoice.createdAt)
    expect(invoiceDb.updatedAt).toStrictEqual(invoice.updatedAt)
    expect(invoiceDb.items.length).toEqual(2)
    expect(invoiceDb.items[0].name).toEqual(invoice.items[0].name)
    expect(invoiceDb.items[0].price).toEqual(invoice.items[0].price)
    expect(invoiceDb.items[1].name).toEqual(invoice.items[1].name)
    expect(invoiceDb.items[1].price).toEqual(invoice.items[1].price)
  })

  it("should find an invoice with its items", async () => {
    const invoice = await InvoiceModel.create({
      id: '1',
      name: 'John Doe',
      document: '1234-5678',
      street: 'Rua 123',
      number: '99',
      complement: 'Green House',
      city: 'Criciúma',
      state: 'SC',
      zipcode: '88888-888',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const item = await InvoiceItemModel.create({
      id: '1',
      name: 'Item 1',
      price: 100,
      invoiceId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const repository = new InvoiceRepository()
    const result = await repository.find(invoice.id)

    expect(result.id.id).toEqual(invoice.id)
    expect(result.name).toEqual(invoice.name)
    expect(result.address.street).toEqual(invoice.street)
    expect(result.address.number).toEqual(invoice.number)
    expect(result.address.complement).toEqual(invoice.complement)
    expect(result.address.city).toEqual(invoice.city)
    expect(result.address.state).toEqual(invoice.state)
    expect(result.address.zipCode).toEqual(invoice.zipcode)
    expect(result.items.length).toEqual(1)
    expect(result.items[0].id.id).toEqual(item.id)
    expect(result.items[0].name).toEqual(item.name)
    expect(result.items[0].price).toEqual(item.price)
  })

  it('should throw an error when invoice is not found', async () => {
    const repository = new InvoiceRepository()

    try {
      await repository.find('1')
    } catch (error) {
      expect((error as Error).message).toEqual('Invoice not found')
    }
  })
})
