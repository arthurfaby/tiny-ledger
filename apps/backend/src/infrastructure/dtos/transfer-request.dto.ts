import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class TransferRequestDto {
  @IsString()
  @IsNotEmpty()
  fromAccountId!: string;

  @IsString()
  @IsNotEmpty()
  toAccountId!: string;

  @IsInt()
  @IsPositive()
  amount!: number;

  @IsString()
  @Length(3, 3)
  currency!: string;
}
