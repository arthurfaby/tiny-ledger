import { Money } from './money';

describe('Money', () => {
  it('should initialize with cents and currency', () => {
    const money = new Money(1000, 'EUR');
    expect(money.amount).toEqual(1000);
    expect(money.currency).toEqual('EUR');
  });

  it('should throw if currency is not integer', () => {
    expect(() => {
      new Money(100.5, 'EUR');
    }).toThrow('Amount must be an integer');
  });

  it('can add two values', () => {
    const tenEuros = new Money(1000, 'EUR');
    const twentyEuros = new Money(2000, 'EUR');
    const thirtyEuros = tenEuros.add(twentyEuros);
    expect(thirtyEuros.amount).toEqual(3000);
    expect(thirtyEuros.currency).toEqual('EUR');
  });

  it('can not add two values with different currencies', () => {
    const tenEuros = new Money(1000, 'EUR');
    const twentyEuros = new Money(2000, 'USD');
    expect(() => {
      tenEuros.add(twentyEuros);
    }).toThrow('Cannot operate on different currencies');
  });

  it('can subtract two values', () => {
    const tenEuros = new Money(1000, 'EUR');
    const twentyEuros = new Money(2000, 'EUR');
    const minusTenEuros = tenEuros.subtract(twentyEuros);
    expect(minusTenEuros.amount).toEqual(-1000);
    expect(minusTenEuros.currency).toEqual('EUR');
  });

  it('can not subtract two values with different currencies', () => {
    const tenEuros = new Money(1000, 'EUR');
    const twentyEuros = new Money(2000, 'USD');
    expect(() => {
      tenEuros.subtract(twentyEuros);
    }).toThrow('Cannot operate on different currencies');
  });

  it('can check equality', () => {
    const tenEuros = new Money(1000, 'EUR');
    const otherTenEuros = new Money(1000, 'EUR');
    const twentyEuros = new Money(2000, 'EUR');
    const tenDollars = new Money(1000, 'USD');
    expect(tenEuros.equals(otherTenEuros)).toBe(true);
    expect(tenEuros.equals(twentyEuros)).toBe(false);
    expect(tenEuros.equals(tenDollars)).toBe(false);
  });
});
