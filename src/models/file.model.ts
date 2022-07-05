import {model, property} from '@loopback/repository';
import {TenantEntity} from '@BringBeyond/lb4-base-extension';

@model({name: 'files'})
export class File extends TenantEntity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  filename: string;

  @property({
    type: 'string',
    required: true,
    name: 'file_id',
  })
  fileId: string;

  @property({
    type: 'string',
  })
  originalname?: string;

  @property({
    type: 'string',
  })
  fieldname?: string;

  @property({
    type: 'string',
    required: true,
  })
  mimetype: string;

  @property({
    type: 'string',
    name: 'fileencoding',
  })
  encoding?: string;

  @property({
    type: 'number',
    required: true,
    name: 'filesize',
  })
  size: number;

  @property({
    type: 'string',
    name: 'file_type',
  })
  fileType: string;

  @property({
    type: 'boolean',
    name: 'blob_sync',
  })
  blobSync: boolean;

  constructor(data?: Partial<File>) {
    super(data);
  }
}

export interface FileRelations {
  // describe navigational properties here
}

export type FileWithRelations = File & FileRelations;
