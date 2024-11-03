import Invoice from "../domain/invoice";

export default interface InvoiceGateway {
  find(id: string): Promise<Invoice>
  generate(invoice: Invoice): Promise<Invoice>
}
