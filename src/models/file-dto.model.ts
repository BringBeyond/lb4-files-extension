import {Model, model, property} from '@loopback/repository';

@model()
export class FileDto extends Model {
  @property({
    type: 'string',
    required: true,
  })
  parentId: string;

  @property({
    type: 'string',
    required: true,
  })
  parentType: string;

  constructor(data?: Partial<FileDto>) {
    super(data);
  }
}

export interface FileDtoRelations {
  // describe navigational properties here
}

export type FileDtoWithRelations = FileDto & FileDtoRelations;
