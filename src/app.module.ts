import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountModule } from '@modules/account/account.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [CqrsModule.forRoot(), AccountModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
