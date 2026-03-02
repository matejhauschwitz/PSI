export interface AddressDto {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: AddressDto;
  role: 'Admin' | 'User';
}

export interface RegisterRequestDto {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  address: AddressDto;
}

export interface AuditLogDto {
  id: string;
  userId: string;
  action: string;
  entity: string;
  beforeState?: string;
  afterState?: string;
  timestamp: string;
}

export interface BookAddRequest {
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  genre: string;
  description: string;
  publishedYear: number;
  isbn: string;
  stock: number;
}

export interface BookSimpleDto {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  genre: string;
  rating: number;
}

export interface BookDto extends BookSimpleDto {
  description: string;
  publishedYear: number;
  isbn: string;
  stock: number;
}

export interface BooksResponse {
  items: BookSimpleDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CommentDto {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface OrderAddRequest {
  bookIds: string[];
  shippingAddress: AddressDto;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  items: BookSimpleDto[];
}
