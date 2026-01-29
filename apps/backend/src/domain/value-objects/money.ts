import { InvalidCurrencyError } from '../exceptions/invalid-currency-error';

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount % 1 !== 0) {
      throw new Error('Amount must be an integer');
    }
    this.amount = amount;
    this.currency = currency;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new InvalidCurrencyError('Cannot operate on different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new InvalidCurrencyError('Cannot operate on different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
