export interface GrpcClientConfig {
  readonly package: string | Array<string>;
  readonly protoPath: string | Array<string>;
  readonly url: string;
}
