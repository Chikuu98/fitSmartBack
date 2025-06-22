import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class LoginDto {
    @IsEmail()
    @ApiProperty({ example: 'chiran@example.com' })
  email: string;

    @IsString()
    @Length(6, 255)
    @ApiProperty({ example: 'password123' })
  password: string;
}
