import GenerateInvoiceUseCase from "./generate-invoice.usecase"

const MockRepository = () => {
  return {
    generate: jest.fn().mockImplementation((invoice) => invoice),
    find: jest.fn()
  }
}

describe("Add Client use case unit test", () => {
  it("should add a client", async () => {
    const repository = MockRepository()
    const usecase = new GenerateInvoiceUseCase(repository)

    const result = await usecase.execute({
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

    expect(repository.generate).toHaveBeenCalled()
    expect(result.id).toBeDefined()
    expect(result.name).toEqual("John Doe")
    expect(result.document).toEqual("1234-5678")
    expect(result.street).toEqual("Rua 123")
    expect(result.number).toEqual("99")
    expect(result.complement).toEqual("Green House")
    expect(result.city).toEqual("Criciúma")
    expect(result.state).toEqual("SC")
    expect(result.zipCode).toEqual("88888-888")
    expect(result.items).toEqual([
      {
        id: expect.any(String),
        name: 'Item 1',
        price: 100
      },
      {
        id: expect.any(String),
        name: 'Item 2',
        price: 200
      }
    ])
  })
})
