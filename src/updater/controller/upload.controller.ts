import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import Multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TypedParam, TypedRoute } from '@nestia/core';

export interface IFileUpload {
  file: File;
}

export class UploadFileDto {
  /**
   * @format binary
   */
  file!: File;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @TypedRoute.Post(':branch/:version')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: Multer.diskStorage({
        destination: (req, file, callback) => {
          const { branch, version } = req.params;

          const uploadPath = join(
            process.cwd(),
            'slimevr-server',
            branch.toString(),
            version.toString()
          );

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    })
  )
  uploadFile(
    @TypedParam('branch') branch: string,
    @TypedParam('version') version: string,
    //@TypedBody() _body: UploadFileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        /*
        .addFileTypeValidator({
          fileType: /(zip|octet-stream|x-executable|vnd\.appimage)/,
        })
          */
        // Limit upload size to 600mb
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 600 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    file: Express.Multer.File
  ) {
    return {
      message: 'Upload successful',
      path: file.path,
    };
  }
}
