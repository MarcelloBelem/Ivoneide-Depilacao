// src/utils/money.js
import Decimal from 'decimal.js';
import { z } from "zod";

export class Money {
  private value: Decimal;

  constructor(amount: number | string | Decimal) {
    this.value = new Decimal(amount);
  }

  static fromCents(cents: number | string): Money {
    const amount = new Decimal(cents).dividedBy(100);
    return new Money(amount);
  }

  add(amount: Money | number | string): Money {
    const decimalAmount = amount instanceof Money ? amount.value : new Decimal(amount);
    return new Money(this.value.plus(decimalAmount));
  }

  subtract(amount: Money | number | string): Money {
    const decimalAmount = amount instanceof Money ? amount.value : new Decimal(amount);
    return new Money(this.value.minus(decimalAmount));
  }

  multiply(multiplier: number | string): Money {
    const decimalMultiplier = new Decimal(multiplier);
    return new Money(this.value.times(decimalMultiplier));
  }

  divide(divisor: number | string): Money {
    const decimalDivisor = new Decimal(divisor);
    return new Money(this.value.dividedBy(decimalDivisor));
  }

  toString(): string {
    return this.value.toFixed(2); // Formata com duas casas decimais
  }

  formatToCurrency(currency: "BRL" | "USD" = "USD"): string {
    const commaSeparatedCurrencies = new Set(["BRL"]);
    if(commaSeparatedCurrencies.has(currency)) {
      return `R$ ${this.value.toFixed(2).split('.').join(',')}`;
    }

    return `$ ${this.value.toFixed(2)}`;
  }

  toCents(): number {
    return this.value.times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
  }
}

// ================================================================================

// Definindo o MoneySchema para uso com Zod
export const MoneySchema = z.union([
  z.instanceof(Money), // Permite que já seja uma instância de Money
  z.string().transform((val) => {
    // Tenta criar Money a partir de string
    try {
      return new Money(val);
    } catch (e) {
      throw new Error("Invalid string for Money");
    }
  }),
  z.number().transform((val) => {
    // Tenta criar Money a partir de number
    try {
      return new Money(val);
    } catch (e) {
      throw new Error("Invalid number for Money");
    }
  }),
]).refine(value => value instanceof Money, {
  message: "Value must be a valid Money instance, string, or number",
});