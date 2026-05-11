import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { VersionsService } from '../services';
import type { Version } from '../types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Versions')
@Controller('versions')
export class VersionsController {
  constructor(private readonly service: VersionsService) {}

  @TypedRoute.Get()
  async getAllVersionsFromDefaultChannel() {
    return await this.service.getAllVersionsFromDefaultChannel();
  }

  @TypedRoute.Get('/latest')
  async getLatestDefaultVersion() {
    return await this.service.getLatestDefaultVersion();
  }

  @TypedRoute.Get(':name')
  async getAllVersionsFromChannelByName(@TypedParam('name') name: string) {
    return await this.service.getAllVersionsFromChannelByName(name);
  }

  @TypedRoute.Post()
  async addReleaseVersionToChannel(@TypedBody() version: Version) {
    return await this.service.addVersionToChannel(version);
  }
}
