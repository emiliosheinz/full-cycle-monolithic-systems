import { Sequelize } from "sequelize-typescript"
import InvoiceModel from "../repository/invoice.model"
import InvoiceItemModel from "../repository/invoice-item.model"
import InvoiceRepository from "../repository/invoice.repository"
import GenerateInvoiceUseCase from "../usecase/generate-invoice/generate-invoice.usecase"
import InvoiceFacade from "./invoice.facade"
import FindInvoiceUseCase from "../usecase/find-invoice/find-invoice.usecase"
import InvoiceFacadeFactory from "../factory/invoice.facade.factory"


describe("Invoice Facade test", () => {
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

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create()

    await facade.generate({
      name: 'John Doe',
      document: '1234-5678',
      street: 'Rua 123',
      number: '99',
      complement: 'Green House',
      city: 'Criciúma',
      state: 'SC',
      zipCode: '88888-888',
      items: [
        {
          name: 'Item 1',
          price: 100
        },
        {
          name: 'Item 2',
          price: 200
        }
      ]
    })

    const invoice = await InvoiceModel.findOne({ where: { name: 'John Doe' }, include: { all: true } })

    expect(invoice).toBeDefined()
    expect(invoice.id).toBeDefined()
    expect(invoice.name).toBe("John Doe")
    expect(invoice.document).toBe("1234-5678")
    expect(invoice.street).toBe("Rua 123")
    expect(invoice.number).toBe("99")
    expect(invoice.complement).toBe("Green House")
    expect(invoice.city).toBe("Criciúma")
    expect(invoice.state).toBe("SC")
    expect(invoice.zipcode).toBe("88888-888")
    expect(invoice.items).toHaveLength(2)
    expect(invoice.items[0].name).toBe("Item 1")
    expect(invoice.items[0].price).toBe(100)
    expect(invoice.items[1].name).toBe("Item 2")
    expect(invoice.items[1].price).toBe(200)
  })

  it("should find an invoice", async () => {

    const facade = InvoiceFacadeFactory.create()

    const generatedInvoice = await facade.generate({
      name: 'John Doe',
      document: '1234-5678',
      street: 'Rua 123',
      number: '99',
      complement: 'Green House',
      city: 'Criciúma',
      state: 'SC',
      zipCode: '88888-888',
      items: [
        {
          name: 'Item 1',
          price: 100
        },
        {
          name: 'Item 2',
          price: 200
        }
      ]
    })

    const invoice = await facade.find({ id: generatedInvoice.id })

    expect(invoice).toBeDefined()
    expect(invoice.id).toBe(generatedInvoice.id)
    expect(invoice.name).toBe("John Doe")
    expect(invoice.document).toBe("1234-5678")
    expect(invoice.address.street).toBe("Rua 123")
    expect(invoice.address.number).toBe("99")
    expect(invoice.address.complement).toBe("Green House")
    expect(invoice.address.city).toBe("Criciúma")
    expect(invoice.address.state).toBe("SC")
    expect(invoice.address.zipCode).toBe("88888-888")
    expect(invoice.items).toHaveLength(2)
    expect(invoice.items[0].name).toBe("Item 1")
    expect(invoice.items[0].price).toBe(100)
    expect(invoice.items[1].name).toBe("Item 2")
    expect(invoice.items[1].price).toBe(200)
  })
})
