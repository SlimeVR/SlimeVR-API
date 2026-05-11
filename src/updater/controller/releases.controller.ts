import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReleasesService } from '../services';
import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import type { Release } from '../types';

@ApiTags('Releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly serivce: ReleasesService) {}

  @TypedRoute.Get()
  async getLatestStable() {
    return await this.serivce.getLatestStable();
  }

  @TypedRoute.Get(':semver')
  async getVersionBysemver(@TypedParam('semver') semver: string) {
    return await this.serivce.getVersionBysemver(semver);
  }

  @TypedRoute.Post()
  async addRelease(@TypedBody() release: Release) {
    return await this.serivce.addRelease(release);
  }
}
