export interface GrpcMetadata {
  get(key: string): Array<string | Buffer>;
}
