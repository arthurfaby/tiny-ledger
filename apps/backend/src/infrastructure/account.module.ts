import { Module } from '@nestjs/common';
import { TransferMoneyUseCase } from '../application/use-cases/transfer-money.use-case';
import { AccountRepository } from '../domain/repositories/account.repository';
import { AccountController } from './controllers/account.controller';
import { PrismaAccountRepository } from './repositories/prisma-account.repository';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [
    {
      provide: 'AccountRepository',
      useClass: PrismaAccountRepository,
    },
    {
      provide: TransferMoneyUseCase,
      useFactory: (repository: AccountRepository) =>
        new TransferMoneyUseCase(repository),
      inject: ['AccountRepository'],
    },
  ],
  exports: [TransferMoneyUseCase],
})
export class AccountModule {}
