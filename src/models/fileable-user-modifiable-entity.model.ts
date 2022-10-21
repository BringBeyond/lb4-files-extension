import {UserModifiableEntity} from '@BringBeyond/lb4-base-extension';
import {hasMany, property} from '@loopback/repository';
import {FileableFile} from '.';

export abstract class FileableUserModifiableEntity extends UserModifiableEntity {
  @property({
    type: 'string',
    name: 'fileable_type',
  })
  fileableType: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @hasMany(() => FileableFile, {keyTo: 'fileableId'})
  fileableFiles: FileableFile[];
}
