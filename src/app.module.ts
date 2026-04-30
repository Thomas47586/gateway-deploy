import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules-api/auth/auth.module';
import { PrismaModule } from './modules-system/prisma/prisma.module';
import { TokenModule } from './modules-system/token/token.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProtechGuard } from './common/guards/protect.guard';
import { RoleGuard } from './common/guards/role.guard';
import { ArticleModule } from './modules-api/article/article.module';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ResonseSuccessInterceptor } from './common/interceptor/response-success.interceptor';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { REDIS_URL } from './common/constant/app.constant';
import type { Cache } from 'cache-manager';
import { ElasticSearchModule } from './modules-system/elastic-search/elastic-search.module';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchAppModule } from './modules-api/search-app/search-app.module';
import { TotpModule } from './modules-api/totp/totp.module';
import { OrderModule } from './modules-api/order/order.module';
import { RabbitMqModule } from './modules-system/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TokenModule,
    ArticleModule,
    CacheModule.register({
      isGlobal: true,
      // Sử dụng Redis để cache
      stores: [new KeyvRedis(REDIS_URL)],
    }),
    ElasticSearchModule,
    SearchAppModule,
    TotpModule,
    OrderModule,
    RabbitMqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ProtechGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResonseSuccessInterceptor,
    },
  ],
})
export class AppModule {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}
  async onModuleInit() {
    try {
      this.cacheManager.get('healthcheck');
      console.log('[REDIS] Kết nối thành công');
    } catch (error) {
      console.log({ cacheManager: error });
    }
    // ----
    try {
      const result = await this.elasticsearchService.ping();
      console.log('[ELASTIC-SEARCH] Kết nối thành công');
    } catch (error) {
      console.log({ elasticsearchService: error });
    }
  }
}
