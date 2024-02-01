export type JsonDto<
  Type extends string = string,
  Id extends string = string,
  Data extends object = object,
> = {
  id: Id;
  type: Type;
  data: Data;
};

export type JsonErrorDto<
  Type extends string = string,
  Id extends string = string,
  Error extends object = object,
> = {
  id: Id;
  type: Type;
  error: Error;
};
