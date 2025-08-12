import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as any;
    return Object.values(object).some((value) => value !== undefined);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Debe proporcionar al menos un campo para actualizar';
  }
}

function AtLeastOneField(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneField',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: AtLeastOneFieldConstraint,
    });
  };
}

export class UpdateBartenderConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  protocolo_api?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  host?: string;

  @IsOptional()
  @IsInt()
  puerto?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ruta_api?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre_integracion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  comando?: string;

  @AtLeastOneField({
    message: 'Debe proporcionar al menos un campo para actualizar',
  })
  dummy!: any;
}
