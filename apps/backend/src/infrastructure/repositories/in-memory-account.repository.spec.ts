import { InMemoryAccountRepository } from './in-memory-account.repository';
import { Account } from '../../domain/entities/account';
import { Money } from '../../domain/value-objects/money';
import { AccountRepository } from '../../domain/repositories/account.repository';

describe('InMemoryAccountRepository', () => {
  let repository: AccountRepository;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
  });

  it('should add an account', async () => {
    const account = new Account('id', new Money(1000, 'EUR'));
    await repository.save(account);
    const findAccount = await repository.findById(account.id);
    expect(findAccount?.id).toEqual(account.id);
    expect(findAccount?.balance.equals(new Money(1000, 'EUR'))).toBeTruthy();
  });

  it('should not find an account', async () => {
    const findAccount = await repository.findById('id');
    expect(findAccount).toEqual(null);
  });
});
