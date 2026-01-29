import { AccountRepository } from '../../domain/repositories/account.repository';
import { Money } from '../../domain/value-objects/money';
import { Account } from '../../domain/entities/account';

export class InMemoryAccountRepository implements AccountRepository {
  accounts = new Map<string, Account>();

  constructor() {
    this.accounts.set('1', new Account('1', new Money(10000, 'EUR')));
    this.accounts.set('2', new Account('2', new Money(0, 'EUR')));
  }

  async findById(id: string): Promise<Account | null> {
    const account = this.accounts.get(id);
    if (!account) {
      return null;
    }
    return new Account(
      account.id,
      new Money(account.balance.amount, account.balance.currency),
    );
  }

  async save(account: Account): Promise<void> {
    this.accounts.set(account.id, account);
  }
}
