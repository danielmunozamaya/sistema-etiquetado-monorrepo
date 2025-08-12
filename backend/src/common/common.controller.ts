import { Controller, Get } from '@nestjs/common';

@Controller('common')
export class CommonController {
  constructor() {}

  @Get('heartbit')
  heartBit() {
    return { alive: true };
  }
}
