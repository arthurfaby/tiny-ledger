import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account';
import { Money } from '../../domain/value-objects/money';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaAccountRepository
  implements AccountRepository, OnModuleInit
{
  private prisma: PrismaClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  async findById(id: string): Promise<Account | null> {
    const row = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!row) return null;

    return new Account(row.id, new Money(row.balance, row.currency));
  }

  async save(account: Account): Promise<void> {
    await this.prisma.account.upsert({
      where: { id: account.id },
      update: {
        balance: account.balance.amount,
        currency: account.balance.currency,
      },
      create: {
        id: account.id,
        balance: account.balance.amount,
        currency: account.balance.currency,
      },
    });
  }
}
