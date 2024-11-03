import Address from "../../../@shared/domain/value-object/address"
import Id from "../../../@shared/domain/value-object/id.value-object"
import Invoice from "../../domain/invoice"
import InvoiceItem from "../../domain/invoice-item"
import FindInvoiceUseCase from "./find-invoice.usecase"


const invoice = new Invoice({
  id: new Id("1"),
  name: "John Doe",
  document: "1234-5678",
  address: new Address(
    "Rua 123",
    "99",
    "Green House",
    "Criciúma",
    "SC",
    "88888-888",
  ),
  items: [
    new InvoiceItem({
      id: new Id("1"),
      name: "Item 1",
      price: 100
    }),
    new InvoiceItem({
      id: new Id("2"),
      name: "Item 2",
      price: 200
    })
  ]
})

const MockRepository = () => {
  return {
    generate: jest.fn(),
    find: jest.fn().mockResolvedValue(invoice)
  }
}

describe("Find Invoice use case", () => {
  it("should find an invoice", async () => {
    const repository = MockRepository()
    const usecase = new FindInvoiceUseCase(repository)

    const input = {
      id: "1"
    }

    const result = await usecase.execute(input)

    expect(repository.find).toHaveBeenCalled()
    expect(result.id).toBeDefined()
    expect(result.name).toEqual("John Doe")
    expect(result.document).toEqual("1234-5678")
    expect(result.address.street).toEqual("Rua 123")
    expect(result.address.number).toEqual("99")
    expect(result.address.complement).toEqual("Green House")
    expect(result.address.city).toEqual("Criciúma")
    expect(result.address.state).toEqual("SC")
    expect(result.address.zipCode).toEqual("88888-888")
    expect(result.createdAt).toBeDefined()
    expect(result.items.length).toEqual(2)
    expect(result.items[0].name).toEqual("Item 1")
    expect(result.items[0].price).toEqual(100)
    expect(result.items[1].name).toEqual("Item 2")
    expect(result.items[1].price).toEqual(200)
  })
})
