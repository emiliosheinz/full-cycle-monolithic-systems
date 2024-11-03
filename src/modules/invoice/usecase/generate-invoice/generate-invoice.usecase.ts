import Address from "../../../@shared/domain/value-object/address";
import Invoice from "../../domain/invoice";
import InvoiceItem from "../../domain/invoice-item";
import InvoiceRepository from "../../repository/invoice.repository";
import { GenerateInvoiceUseCaseInputDto, GenerateInvoiceUseCaseOutputDto } from "./generate-invoice.dto";

export default class GenerateInvoiceUseCase {

  private invoiceRepository: InvoiceRepository

  constructor(invoiceRepository: InvoiceRepository) {
    this.invoiceRepository = invoiceRepository
  }

  async execute(input: GenerateInvoiceUseCaseInputDto): Promise<GenerateInvoiceUseCaseOutputDto> {
    const invoice = new Invoice({
      name: input.name,
      document: input.document,
      address: new Address(
        input.street,
        input.number,
        input.complement,
        input.city,
        input.state,
        input.zipCode,
      ),
      items: input.items.map((item) => (new InvoiceItem({
        name: item.name,
        price: item.price
      })))
    })

    const generatedInvoice = await this.invoiceRepository.generate(invoice)

    return {
      id: generatedInvoice.id.id,
      name: generatedInvoice.name,
      document: generatedInvoice.document,
      street: generatedInvoice.address.street,
      number: generatedInvoice.address.number,
      complement: generatedInvoice.address.complement,
      city: generatedInvoice.address.city,
      state: generatedInvoice.address.state,
      zipCode: generatedInvoice.address.zipCode,
      items: generatedInvoice.items.map((item) => ({
        id: item.id.id,
        name: item.name,
        price: item.price
      })),
      total: generatedInvoice.getTotal(),
    }
  }
}
