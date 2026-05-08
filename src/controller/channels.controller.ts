import { Controller, Post } from '@nestjs/common';
import { ChannelsService } from '../services';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Post()
  async createReleaseChannel() {
    return await this.service.addReleaseChannel();
  }
}
