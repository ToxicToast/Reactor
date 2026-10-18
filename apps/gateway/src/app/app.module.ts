import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { BlogModule } from './blog/blog.module';
import { DiscordModule } from './discord/discord.module';
import { FoodfolioModule } from './foodfolio/foodfolio.module';
import { InstagramModule } from './instagram/instagram.module';
import { TwitchModule } from './twitch/twitch.module';
import { WarcraftModule } from './warcraft/warcraft.module';
import { YoutubeModule } from './youtube/youtube.module';
import { AuthModule } from './auth/auth.module';
import { WebhookModule } from './webhook/webhook.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    AiModule,
    AuthModule,
    BlogModule,
    DiscordModule,
    FoodfolioModule,
    InstagramModule,
    SseModule,
    TwitchModule,
    WarcraftModule,
    WebhookModule,
    YoutubeModule
  ],
})
export class AppModule {}
