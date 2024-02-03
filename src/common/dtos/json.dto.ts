export type JsonDto<
  Type extends string = string,
  Id extends string = string,
  Data extends object = object,
> = {
  id: Id;
  type: Type;
  data: Data;
} & { [_ in string]: unknown };

export type JsonErrorDto<
  Type extends string = string,
  Id extends string = string,
  Error extends object = object,
> = {
  id: Id;
  type: Type;
  error: Error;
} & { [_ in string]: unknown };
