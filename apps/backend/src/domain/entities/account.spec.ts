import { Money } from '../value-objects/money';
import { Account } from './account';
import { InsufficientFundsError } from '../exceptions/insufficient-funds-error';
import { BusinessRuleValidationError } from '../exceptions/business-rule-validation.error';

describe('Account', () => {
  it('should initialize with id and initial balance', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    expect(account.balance.equals(tenEuros)).toBe(true);
    expect(account.id).toEqual('my-id');
  });

  it('can deposit money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const fiveEuros = new Money(500, 'EUR');
    account.deposit(fiveEuros);
    expect(account.balance.amount).toBe(1500);
  });

  it('can not deposit money with another currency', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const fiveDollars = new Money(500, 'USD');
    expect(() => {
      account.deposit(fiveDollars);
    }).toThrow(BusinessRuleValidationError);
  });

  it('can not deposit 0 money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const zeroEuros = new Money(0, 'EUR');
    expect(() => {
      account.deposit(zeroEuros);
    }).toThrow(BusinessRuleValidationError);
  });

  it('can not deposit negative money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const minusTenEuros = new Money(-1000, 'EUR');
    expect(() => {
      account.deposit(minusTenEuros);
    }).toThrow(BusinessRuleValidationError);
  });

  it('can withdraw money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const fiveEuros = new Money(500, 'EUR');
    account.withdraw(fiveEuros);
    expect(account.balance.amount).toBe(500);
  });

  it('can not withdraw more money than funds', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const twentyEuros = new Money(2000, 'EUR');
    expect(() => {
      account.withdraw(twentyEuros);
    }).toThrow(InsufficientFundsError);
  });

  it('can not withdraw money from another currency', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const fiveDollars = new Money(500, 'USD');
    expect(() => {
      account.withdraw(fiveDollars);
    }).toThrow(BusinessRuleValidationError);
  });

  it('can not withdraw 0 money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const zeroEuros = new Money(0, 'EUR');
    expect(() => {
      account.withdraw(zeroEuros);
    }).toThrow(BusinessRuleValidationError);
  });

  it('can not withdraw negative money', () => {
    const tenEuros = new Money(1000, 'EUR');
    const account = new Account('my-id', tenEuros);
    const minusTenEuros = new Money(-1000, 'EUR');
    expect(() => {
      account.withdraw(minusTenEuros);
    }).toThrow(BusinessRuleValidationError);
  });
});
