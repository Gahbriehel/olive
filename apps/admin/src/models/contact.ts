import { IBaseResponse } from "./base";

export interface IContactResponse extends IBaseResponse {
  data: {
    items: IContact[];
  };
}

export interface IContact {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  message: string;
  isPrivate?: boolean | null;
  createdAt: string;
  updatedAt: string;
}
