import { Money } from '../../domain/value-objects/money';
import { Account } from '../../domain/entities/account';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { TransferMoneyUseCase } from './transfer-money.use-case';
import { AccountNotFoundError } from '../../domain/exceptions/account-not-found.error';
import { BusinessRuleValidationError } from '../../domain/exceptions/business-rule-validation.error';
import { InsufficientFundsError } from '../../domain/exceptions/insufficient-funds-error';

class InMemoryAccountRepository implements AccountRepository {
  accounts: Record<string, Account | undefined> = {};

  findById(id: string): Promise<Account | null> {
    return Promise.resolve(this.accounts[id] ?? null);
  }

  save(account: Account): Promise<void> {
    this.accounts[account.id] = account;
    return Promise.resolve();
  }
}

describe('TransferMoney use case', () => {
  let accountRepository: AccountRepository;
  let transferMoneyUseCase: TransferMoneyUseCase;

  beforeEach(() => {
    accountRepository = new InMemoryAccountRepository();
    transferMoneyUseCase = new TransferMoneyUseCase(accountRepository);
  });

  it('should not find sender', async () => {
    const tenEuros = new Money(1000, 'EUR');
    const senderAccount = new Account('sender-id', tenEuros);
    const receiverAccount = new Account('receiver-id', tenEuros);
    await accountRepository.save(receiverAccount);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
        amount: 500,
        currency: 'EUR',
      }),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('should not find receiver', async () => {
    const tenEuros = new Money(1000, 'EUR');
    const senderAccount = new Account('sender-id', tenEuros);
    const receiverAccount = new Account('receiver-id', tenEuros);
    await accountRepository.save(senderAccount);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
        amount: 500,
        currency: 'EUR',
      }),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('should not transfer to itself', async () => {
    const account = new Account('custom-id', new Money(1000, 'EUR'));
    await accountRepository.save(account);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: account.id,
        receiverAccountId: account.id,
        amount: 500,
        currency: 'EUR',
      }),
    ).rejects.toThrow(BusinessRuleValidationError);
  });

  it('should not transfer money because of insufficient funds', async () => {
    const tenEuros = new Money(1000, 'EUR');
    const senderAccount = new Account('sender-id', tenEuros);
    const receiverAccount = new Account('receiver-id', tenEuros);
    await accountRepository.save(senderAccount);
    await accountRepository.save(receiverAccount);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
        amount: 5000,
        currency: 'EUR',
      }),
    ).rejects.toThrow(InsufficientFundsError);
  });

  it('should not transfer money because of money not in good currency', async () => {
    const tenEuros = new Money(1000, 'EUR');
    const senderAccount = new Account('sender-id', tenEuros);
    const receiverAccount = new Account('receiver-id', tenEuros);
    await accountRepository.save(senderAccount);
    await accountRepository.save(receiverAccount);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
        amount: 500,
        currency: 'USD',
      }),
    ).rejects.toThrow(BusinessRuleValidationError);
  });

  it('should not transfer money because of one account in not another currency', async () => {
    const tenEuros = new Money(1000, 'EUR');
    const tenDollars = new Money(1000, 'USD');
    const senderAccount = new Account('sender-id', tenEuros);
    const receiverAccount = new Account('receiver-id', tenDollars);
    await accountRepository.save(senderAccount);
    await accountRepository.save(receiverAccount);
    await expect(
      transferMoneyUseCase.execute({
        senderAccountId: senderAccount.id,
        receiverAccountId: receiverAccount.id,
        amount: 500,
        currency: 'EUR',
      }),
    ).rejects.toThrow(BusinessRuleValidationError);
  });

  it('should transfer money', async () => {
    const senderAccount = new Account('sender-id', new Money(1000, 'EUR'));
    const receiverAccount = new Account('receiver-id', new Money(1000, 'EUR'));
    await accountRepository.save(senderAccount);
    await accountRepository.save(receiverAccount);
    await transferMoneyUseCase.execute({
      senderAccountId: senderAccount.id,
      receiverAccountId: receiverAccount.id,
      amount: 500,
      currency: 'EUR',
    });
    const updatedSenderAccout = await accountRepository.findById(
      senderAccount.id,
    );
    const updatedReceiverAccount = await accountRepository.findById(
      receiverAccount.id,
    );
    expect(updatedSenderAccout?.balance.equals(new Money(500, 'EUR'))).toEqual(
      true,
    );
    expect(
      updatedReceiverAccount?.balance.equals(new Money(1500, 'EUR')),
    ).toEqual(true);
  });
});
