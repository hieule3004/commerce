export type JsonDto<
  Type extends string = string,
  Id extends string = string,
  Data extends object = object,
> = {
  id: Id;
  type: Type;
  data: Data;
};
