export interface RequestLogDto {
  readonly requestId: string;
  readonly method: string;
  readonly url: string;
}

export interface ResponseLogDto {
  readonly requestId: string;
  readonly code: number;
  readonly message: string;
  elapsedMs: number;
}
