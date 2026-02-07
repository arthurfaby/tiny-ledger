import { Body, Controller, Post } from '@nestjs/common';
import { TransferMoneyUseCase } from '../../application/use-cases/transfer-money.use-case';
import { TransferRequestDto } from '../dtos/transfer-request.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly transferUseCase: TransferMoneyUseCase) {}

  @Post('transfer')
  async transfer(
    @Body() dto: TransferRequestDto,
  ): Promise<{ message: string }> {
    await this.transferUseCase.execute({
      receiverAccountId: dto.toAccountId,
      senderAccountId: dto.fromAccountId,
      amount: dto.amount,
      currency: dto.currency,
    });
    return { message: 'Transfer completed successfully' };
  }
}
