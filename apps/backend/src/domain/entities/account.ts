import { Money } from '../value-objects/money';
import { InsufficientFundsError } from '../exceptions/insufficient-funds-error';
import { InvalidCurrenctError } from '../exceptions/invalid-currenct-error';
import { MustBePositiveError } from '../exceptions/must-be-positive-error';

export class Account {
  balance: Money;

  constructor(
    public readonly id: string,
    initialBalance: Money,
  ) {
    this.balance = initialBalance;
  }

  public deposit(money: Money): void {
    if (this.balance.currency !== money.currency) {
      throw new InvalidCurrenctError('Cannot deposit different currency');
    }
    if (money.amount <= 0) {
      throw new MustBePositiveError('Deposit amount must be positive');
    }
    this.balance = this.balance.add(money);
  }

  public withdraw(money: Money): void {
    if (this.balance.currency !== money.currency) {
      throw new InvalidCurrenctError('Cannot withdraw different currency');
    }
    if (money.amount <= 0) {
      throw new MustBePositiveError('Withdraw amount must be positive');
    }
    if (this.balance.amount < money.amount) {
      throw new InsufficientFundsError('Insufficient funds');
    }
    this.balance = this.balance.subtract(money);
  }
}
