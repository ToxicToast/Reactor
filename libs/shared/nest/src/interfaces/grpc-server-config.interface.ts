export interface GrpcServerConfig {
  readonly package: string | Array<string>;
  readonly protoPath: string | Array<string>;
}
