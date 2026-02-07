import { BusinessRuleValidationError } from '../exceptions/business-rule-validation.error';

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount % 1 !== 0) {
      throw new BusinessRuleValidationError('Amount must be an integer');
    }
    this.amount = amount;
    this.currency = currency;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new BusinessRuleValidationError(
        'Cannot operate on different currencies',
      );
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new BusinessRuleValidationError(
        'Cannot operate on different currencies',
      );
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
