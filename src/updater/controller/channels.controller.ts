import { Controller } from '@nestjs/common';
import { ChannelsService } from '../services';
import { ApiTags } from '@nestjs/swagger';
import type { Channel } from '../types';
import { TypedBody, TypedRoute } from '@nestia/core';
import { Public } from '../../auth/public.decorator';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Public()
  @TypedRoute.Get()
  async getAllReleaseChannels() {
    return await this.service.getAllReleaseChannels();
  }

  @TypedRoute.Post()
  async createReleaseChannel(@TypedBody() channel: Channel) {
    return await this.service.addReleaseChannel(channel);
  }
}
