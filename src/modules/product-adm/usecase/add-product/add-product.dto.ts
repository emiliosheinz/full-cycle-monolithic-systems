export interface AddProductInputDto {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface AddProductOutputDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
