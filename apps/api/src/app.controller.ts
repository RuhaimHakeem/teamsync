import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getWelcome() {
    return { message: 'Welcome to the TeamSync API' };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
