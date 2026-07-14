export type ID = string;

export type ISODateString = string;

export type BaseEntity = {
  id: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
