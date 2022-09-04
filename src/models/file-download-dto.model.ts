/*
 * File: file-download-dto.model.ts
 * Project: oncycle-backend
 * File Created: Wednesday, 26th January 2022 3:25:35 pm
 * Author: Max Kirschning
 * -----
 * Last Modified: Tuesday, 1st February 2022 12:51:11 pm
 * Modified By: Max Kirschning
 * -----
 * Copyright 2022, Bahr Rauh Kirschning UG
 */

import {Filter, Model, model, property} from '@loopback/repository';
import {File} from './file.model';

@model()
export class FileDownloadDto extends Model {
  @property({
    type: 'array',
    itemType: 'string',
    required: false,
  })
  fileIds?: string[];

  @property({
    type: 'object',
    itemType: 'string',
    required: false,
  })
  filter?: Filter<File>;

  constructor(data?: Partial<FileDownloadDto>) {
    super(data);
  }
}

export interface FileDownloadDtoRelations {
  // describe navigational properties here
}

export type FileDownloadDtoWithRelations = FileDownloadDto & FileDownloadDtoRelations;
