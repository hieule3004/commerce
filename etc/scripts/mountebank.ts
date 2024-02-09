/**---- Type ----**/

export type Int = number;
export type Email = string;
export type ISODateString = string;

export type InjectFnString = string;
export type DecorateBehaviorFnString = string;
export type ShellBehaviorCommandString = string;

export type PredicateInjectConfig<P extends Protocol> = {
  request: RequestObject<P>;
  state: object;
  logger: Record<'debug' | 'info' | 'warn' | 'error', (...args: unknown[]) => void>;
};

export type ResponseInjectConfig<P extends Protocol> = PredicateInjectConfig<P> & {
  callback: (data: unknown) => void;
};

export type DecorateBehaviorConfig<P extends Protocol> = PredicateInjectConfig<P> & {
  response: ResponseObject<P>;
};

/**---- Http ----**/

export type Method =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

export type Protocol = 'http' | 'https' | 'tcp' | 'smtp';

export type EncodingMode = 'binary' | 'text';

/**---- Imposter ----**/

export type Imposters<P extends Protocol> = { imposters: Imposter<P>[] };

export type AddStub<P extends Protocol> = { index?: number; stub: Stub<P> };

export type Imposter<P extends Protocol> = {
  http: HttpImposter;
  https: HttpsImposter;
  tcp: TcpImposter;
  smtp: SmtpImposter;
}[P];

type HttpImposter = {
  protocol: 'http';
  port?: Int;
  name?: string;
  recordRequests?: boolean;
  stubs?: Stub<'http'>[];
  defaultResponse?: ResponseObject<'http'>;
  allowCORS?: boolean;
};

type HttpsImposter = Omit<HttpImposter, 'protocol' | 'stubs' | 'defaultResponse'> & {
  protocol: 'https';
  stubs?: Stub<'https'>[];
  defaultResponse?: ResponseObject<'https'>;
  key?: string;
  cert?: string;
  ciphers?: string;
  mutualAuth?: boolean;
  ca?: string[];
};

type TcpImposter = {
  protocol: 'tcp';
  port?: Int;
  mode?: EncodingMode;
  name?: string;
  recordRequests?: boolean;
  stubs?: Stub<'tcp'>[];
  defaultResponse?: ResponseObject<'tcp'>;
};

type SmtpImposter = {
  protocol: 'smtp';
  port?: Int;
  name?: string;
  recordRequests?: boolean;
};

export type ResponseObject<P extends Protocol> = {
  http: HttpResponseObject;
  https: HttpsResponseObject;
  tcp: TcpResponseObject;
  smtp: never;
}[P];

type HttpResponseObject = {
  statusCode: Int;
  headers: object;
  body: string | object;
  _mode: EncodingMode;
};

type HttpsResponseObject = HttpResponseObject;

type TcpResponseObject = { data: string };

export type RequestObject<P extends Protocol> = {
  http: HttpRequestObject;
  https: HttpsRequestObject;
  tcp: TcpRequestObject;
  smtp: SmtpRequestObject;
}[P];

type HttpRequestObject = {
  requestFrom: string;
  path: string;
  query: object;
  method: Method;
  headers: Record<string, string | string[]>;
  body: string;
  form: object;
};

type HttpsRequestObject = HttpRequestObject;

type TcpRequestObject = {
  requestFrom: string;
  data: string;
};

type SmtpEmailObject = { address: Email; name: string };

type SmtpRequestObject = {
  requestFrom: string;
  envelopFrom?: Email;
  envelopeTo?: Email[];
  from: SmtpEmailObject;
  to: SmtpEmailObject[];
  cc: SmtpEmailObject[];
  bcc: SmtpEmailObject[];
  subject: string | string[];
  priority: string;
  references: unknown[];
  inReplyTo: unknown[];
  text: string;
  html: string;
  attachments: object[];
  // addition options
  ip?: string;
  timestamp?: ISODateString;
};

/**---- Stub ----**/

export type Stub<P extends Protocol> = {
  predicates: Predicate<P>[];
  responses: Response<P>[];
};

/**---- Response ----**/

// TODO: implement array match http://www.mbtest.org/docs/api/predicates#array-match

type SimplePredicate<P extends Protocol, K extends string> = {
  [k in K]: Partial<RequestObject<P>>;
};
type UnaryPredicate<P extends Protocol, K extends string> = { [k in K]: BasePredicate<P> };
type NaryPredicate<P extends Protocol, K extends string> = { [k in K]: BasePredicate<P>[] };

type ConditionalKeys<S, C> = { [K in keyof S]: S[K] extends C ? K : never }[keyof S];
type NonConditionalKeys<S, C> = { [K in keyof S]: S[K] extends C ? never : K }[keyof S];
type ExistsPredicate<P extends Protocol> = {
  exists: Partial<
    { [K in ConditionalKeys<RequestObject<P>, object>]: object } & {
      [K in NonConditionalKeys<RequestObject<P>, object>]: boolean;
    }
  >;
};

type BasePredicate<P extends Protocol> =
  | SimplePredicate<P, 'equals'>
  | SimplePredicate<P, 'deepEquals'>
  | SimplePredicate<P, 'contains'>
  | SimplePredicate<P, 'startsWith'>
  | SimplePredicate<P, 'endsWith'>
  | SimplePredicate<P, 'matches'>
  | ExistsPredicate<P>
  | UnaryPredicate<P, 'not'>
  | NaryPredicate<P, 'or'>
  | NaryPredicate<P, 'and'>
  | Inject;

export type Predicate<P extends Protocol> = BasePredicate<P> & PredicateParameters;

export type PredicateParameters = {
  caseSensitive?: boolean;
  except?: string;
  xpath?: { selector: string; ns?: Record<string, string> };
  jsonpath?: { selector: string };
};

/**---- Response ----**/

export type IsResponse<P extends Protocol> = { is: Partial<ResponseObject<P>> };

export type PredicateGenerator = {
  matches?: object;
  predicateOperator?: 'equals' | 'deepEquals';
  ignore?: object;
} & Partial<Inject> &
  PredicateParameters;

export type ProxyResponseParameters<P extends Protocol> = {
  http: HttpProxyResponseParameters;
  https: HttpsProxyResponseParameters;
  tcp: TcpProxyResponseParameters;
  smtp: never;
}[P];

type HttpProxyResponseParameters = {
  cert?: string;
  key?: string;
  ciphers?: string;
  secureProtocol?: string;
  passphrase?: string;
  injectHeaders?: object;
};

type HttpsProxyResponseParameters = HttpProxyResponseParameters;

type TcpProxyResponseParameters = {
  keepalive?: boolean;
};

export type ProxyResponse<P extends Protocol> = {
  proxy: {
    to: string;
    predicateGenerators?: PredicateGenerator[];
    mode?: 'proxyOnce' | 'proxyAlways' | 'proxyTransparent';
    addWaitBehavior?: boolean;
    addDecorateBehavior?: DecorateBehaviorFnString;
  };
} & ProxyResponseParameters<P>;

export type FaultResponse<P extends Protocol> = P extends 'http' | 'https' | 'tcp'
  ? { fault: 'CONNECTION_RESET_BY_PEER' | 'RANDOM_DATA_THEN_CLOSE' }
  : never;

export type Response<P extends Protocol> = (
  | IsResponse<P>
  | ProxyResponse<P>
  | Inject
  | FaultResponse<P>
) & {
  repeat?: number;
  behaviors?: StubBehavior[];
};

type UsingBehaviorExpr =
  | { method: 'regex'; selector: string; options?: { ignoreCase?: boolean; multiline?: boolean } }
  | { method: 'xpath'; selector: string; ns?: Record<string, string> }
  | { method: 'jsonpath'; selector: string };

export type StubBehavior =
  | { wait: Int | InjectFnString }
  | { copy: { from: string | object; into: string; using: UsingBehaviorExpr } }
  | {
      lookup: {
        key: { from: string | object; using: UsingBehaviorExpr; index?: Int };
        fromDataSource: { csv: { path: string; keyColumn: string; delimiter?: string } };
        into: string;
      };
    }
  | { decorate: DecorateBehaviorFnString }
  | { shellTransform: ShellBehaviorCommandString };

/**---- Inject ----**/

type Inject = { inject: InjectFnString };
