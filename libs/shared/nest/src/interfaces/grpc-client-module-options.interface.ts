export interface GrpcClientModuleOptions {
  readonly name: string;
  readonly package: string | Array<string>;
  readonly protoPath: string | Array<string>;
  readonly urlEnv: string;
}
