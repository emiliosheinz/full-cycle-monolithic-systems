export interface FindClientUseCaseInputDto {
  id: string;
}

export interface FindClientUseCaseOutputDto {
  id: string;
  name: string;
  email: string;
  document: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date;
}
