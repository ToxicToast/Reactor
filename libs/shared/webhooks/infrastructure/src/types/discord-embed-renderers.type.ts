import type { DiscordEmbedRenderer } from './discord-embed-renderer.type.js';

/** Event-Key → Renderer; fehlt ein Key, gibt es das allgemeine Embed */
export type DiscordEmbedRenderers = Readonly<
  Record<string, DiscordEmbedRenderer>
>;
