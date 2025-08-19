import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActionModule } from './modules/action.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ActionModule,
  ],
})
export class AppModule {}
