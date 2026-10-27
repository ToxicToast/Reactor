export interface CorsConfig {
  readonly origins: ReadonlyArray<string>;
  readonly allowCredentials: boolean;
  readonly maxAgeSeconds: number;
}
