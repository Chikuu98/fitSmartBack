import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({
    example: '4532015112830366',
    description: 'Credit card number (fake validation)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber: string;

  @ApiProperty({
    example: '12/28',
    description: 'Card expiry date (MM/YY)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { 
    message: 'Expiry date must be in MM/YY format' 
  })
  expiryDate: string;

  @ApiProperty({
    example: '123',
    description: 'Card CVV (3 digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(/^\d{3}$/, { message: 'CVV must be 3 digits' })
  cvv: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Cardholder name',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  cardholderName: string;
}