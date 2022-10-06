/*
 * File: file.controller.ts
 * Project: gutachter-backend
 * File Created: Tuesday, 25th January 2022 12:02:19 pm
 * Author: Max Kirschning
 * -----
 * Last Modified: Wednesday, 26th January 2022 1:08:11 pm
 * Modified By: Max Kirschning
 * -----
 * Copyright 2022, Bahr Rauh Kirschning UG
 */

import {AuthUser} from '@BringBeyond/lb4-base-extension';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, post, Request, requestBody, response, Response, RestBindings} from '@loopback/rest';
import * as fs from 'fs-extra';
import {authenticate, AuthenticationBindings, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {PermissionKey} from '../enums/permission-key.enum';
import {BLOB_SERVICE, FILE_UPLOAD_SERVICE} from '../keys';
import {File as FileModel, FileDownloadDto, FileWithRelations} from '../models';
import {FileRepository} from '../repositories';
import {BlobstorageService} from '../services';
import {FileUploadHandler} from '../types';

interface File {
  filename: string;
  fileId: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

/**
 * A controller to handle file uploads using multipart/form-data media type
 */
export class FileController {
  /**
   * Constructor
   * @param fileUploadHandler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject(FILE_UPLOAD_SERVICE)
    private fileUploadHandler: FileUploadHandler,
    @repository(FileRepository)
    public fileRepository: FileRepository,
    @inject(BLOB_SERVICE) private blobstorageService: BlobstorageService,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly user: AuthUser | undefined,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) { }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewFile]})
  @get('/files')
  @response(200, {
    description: 'Array of File model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FileModel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(FileModel) filter?: Filter<File>,
  ): Promise<FileWithRelations[]> {
    return this.fileRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.CreateFile]})
  @post('/files', {
    responses: {
      200: {
        content: {
          'text/plain': {},
        },
        description: 'Creates a temp file',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.fileUploadHandler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
          const files = FileController.getFilesAndFields(request).files;

          // Create file reference in database
          this.fileRepository
            .createAll(files)
            .then()
            .catch(error => {
              console.log(error);
              throw new HttpErrors.FailedDependency();
            });

          const uuid = files[0].fileId;
          resolve(uuid);
        }
      });
    });
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.CreateFile]})
  @del('/file/temp', {
    responses: {
      204: {
        content: {
          'text/plain': {},
        },
        description: 'Deletes a temp file',
      },
    },
  })
  async fileDelete(
    @requestBody({
      content: {
        'text/plain': {},
      },
    })
    id: string,
  ): Promise<void> {
    const fileRecord = await this.fileRepository.findOne({where: {fileId: id}});
    if (fileRecord) {
      await this.fileRepository.delete(fileRecord);
      try {
        await fs.remove(`temp/${fileRecord.filename}`);
        console.log('success!');
      } catch (err) {
        console.error(err);
      }
    } else {
      throw new HttpErrors.NotFound();
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKey.ViewFile]})
  @post('/filedownload')
  async downloadFile(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FileDownloadDto, {
            title: 'getFiles',
          }),
        },
      },
    })
    fileDownloadDto: FileDownloadDto,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    let fileRecords;
    if (fileDownloadDto?.fileIds) {
      fileRecords = await this.fileRepository.find({where: {id: {inq: fileDownloadDto.fileIds}}});
    } else {
      fileRecords = await this.fileRepository.find(fileDownloadDto?.filter);
    }

    if (fileRecords) {
      const fileStrings: Array<Object> = [];
      for (const fileRecord of fileRecords) {
        const fileUrl = await this.blobstorageService.downloadFile(fileRecord, this.user?.defaultTenant ?? '');
        fileStrings.push({fileUrl, id: fileRecord.id, fileId: fileRecord.fileId, filename: fileRecord.originalname, fileType: fileRecord.fileType});
      }

      return fileStrings;
    } else {
      throw new HttpErrors.NotFound();
    }
  }

  /**
   * Get files and fields for the request
   * @param request - Http request
   */
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => ({
      filename: f.filename,
      fileId: f.filename.split('_')[0],
      fieldname: f.fieldname,
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: File[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }
}
