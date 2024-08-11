export interface NewUserType {
    name: string;
    email: string;
    photo: string;
    gender: string;
    _id: string;
    dob: string;
}

export interface NewProductType {
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
}

export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
};

export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
};

export interface NewOrderType {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
}

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
  };
  