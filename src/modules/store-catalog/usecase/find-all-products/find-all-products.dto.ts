export interface FindAllProductsDto {
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
  }[];
}
