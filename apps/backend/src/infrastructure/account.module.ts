import { Module } from '@nestjs/common';
import { InMemoryAccountRepository } from './repositories/in-memory-account.repository';
import { TransferMoneyUseCase } from '../application/use-cases/transfer-money.use-case';
import { AccountRepository } from '../domain/repositories/account.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'AccountRepository',
      useClass: InMemoryAccountRepository,
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
