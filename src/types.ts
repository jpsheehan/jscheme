export type Expr = string | Expr[] | boolean | number | null | Function;
export type Env = { [key: string]: Expr };
