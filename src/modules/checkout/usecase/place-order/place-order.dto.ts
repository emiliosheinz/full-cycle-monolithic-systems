export interface PlaceOrderUseCaseInputDTO {
  clientId: string;
  products: {
    productId: string;
  }[]
}

export interface PlaceOrderUseCaseOutputDTO {
  id: string;
  invoiceId: string;
  status: string;
  total: number;
  products: {
    productId: string;
  }[]
}
