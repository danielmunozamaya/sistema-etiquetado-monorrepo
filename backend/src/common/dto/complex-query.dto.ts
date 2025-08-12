import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export type WhereField =
  | {
      eq?: any;
      neq?: any;
      lt?: any;
      lte?: any;
      gt?: any;
      gte?: any;
      in?: any[];
      nin?: any[];
      isNull?: boolean;
      like?: string;
      between?: [any, any];
    }
  | any;

export type WhereType = Record<string, WhereField>;

export class ComplexQueryDto {
  @IsOptional()
  @IsObject()
  order?: Record<string, 'ASC' | 'DESC'>;

  @IsOptional()
  where?: WhereType | WhereType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  select?: string[];
}
