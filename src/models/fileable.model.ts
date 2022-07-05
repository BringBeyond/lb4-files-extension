import {Entity, model, property} from '@loopback/repository';

@model({name: 'fileables'})
export class Fileable extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
    name: 'fileable_id',
  })
  fileableId: string;

  @property({
    type: 'string',
    required: true,
    id: true,
    name: 'fileable_type',
  })
  fileableType: string;

  constructor(data?: Partial<Fileable>) {
    super(data);
  }
}

export interface FileableRelations {
  // describe navigational properties here
}

export type FileableWithRelations = Fileable & FileableRelations;
