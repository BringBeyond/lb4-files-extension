import {hasMany, property} from '@loopback/repository';
import {File} from '.';
import {UserModifiableEntity} from '@BringBeyond/lb4-base-extension';

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

  @hasMany(() => File, {keyTo: 'fileableId'})
  files: File[];
}
