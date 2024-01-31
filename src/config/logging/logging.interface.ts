export interface RequestLogDto {
  readonly requestId: string;
  readonly method: string;
  readonly url: string;
  readonly path: unknown;
  readonly params: unknown;
  readonly query: unknown;
  readonly body: unknown;
}

export interface ResponseLogDto {
  readonly requestId: string;
  readonly code: number;
  readonly message: string;
  elapsedMs: number;
}
