import { Money } from '../value-objects/money';
import { InsufficientFundsError } from '../exceptions/insufficient-funds-error';
import { BusinessRuleValidationError } from '../exceptions/business-rule-validation.error';

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
      throw new BusinessRuleValidationError('Transaction currency mismatch');
    }
    if (money.amount <= 0) {
      throw new BusinessRuleValidationError(
        'Cannot deposit non positive amount',
      );
    }
    this.balance = this.balance.add(money);
  }

  public withdraw(money: Money): void {
    if (this.balance.currency !== money.currency) {
      throw new BusinessRuleValidationError('Transaction currency mismatch');
    }
    if (money.amount <= 0) {
      throw new BusinessRuleValidationError(
        'Cannot withdraw non positive amount',
      );
    }
    if (this.balance.amount < money.amount) {
      throw new InsufficientFundsError('Insufficient funds');
    }
    this.balance = this.balance.subtract(money);
  }
}
