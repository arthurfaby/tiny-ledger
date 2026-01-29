import { Account } from '../entities/account';

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}
