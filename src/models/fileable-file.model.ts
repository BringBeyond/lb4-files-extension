import {belongsTo, model, property} from '@loopback/repository';
import {FileWithRelations} from '.';
import {File} from './file.model';
import {FileableUserModifiableEntity} from './fileable-user-modifiable-entity.model';

@model({name: 'fileable_files'})
export class FileableFile extends FileableUserModifiableEntity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @belongsTo(
    () => File,
    {name: 'file_id'},
    {
      name: 'file_id',
      required: true,
    },
  )
  fileId: string;

  @property({
    type: 'string',
    required: true,
    name: 'fileable_id',
  })
  fileableId: string;

  constructor(data?: Partial<FileableFile>) {
    super(data);
  }
}

export interface FileableFileRelations {
  file: FileWithRelations
}

export type FileableFileWithRelations = FileableFile & FileableFileRelations;
