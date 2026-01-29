import { AccountRepository } from '../../domain/repositories/account.repository';
import { AccountNotFoundError } from '../../domain/exceptions/account-not-found.error';
import { Money } from '../../domain/value-objects/money';
import { SelfTransferError } from '../../domain/exceptions/self-transfer.error';

export interface TransferMoneyCommand {
  senderAccountId: string;
  receiverAccountId: string;
  amount: number;
  currency: string;
}

export class TransferMoneyUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(command: TransferMoneyCommand): Promise<void> {
    if (command.senderAccountId === command.receiverAccountId) {
      throw new SelfTransferError(
        'Cant transfer money with same sender and receiver',
      );
    }
    const senderAccount = await this.accountRepository.findById(
      command.senderAccountId,
    );
    if (!senderAccount) {
      throw new AccountNotFoundError('Could not find sender account');
    }
    const receiverAccount = await this.accountRepository.findById(
      command.receiverAccountId,
    );
    if (!receiverAccount) {
      throw new AccountNotFoundError('Could not find receiver account');
    }
    const moneyToTransfer = new Money(command.amount, command.currency);
    senderAccount.withdraw(moneyToTransfer);
    receiverAccount.deposit(moneyToTransfer);
    await this.accountRepository.save(senderAccount);
    await this.accountRepository.save(receiverAccount);
  }
}
