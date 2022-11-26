import {inject} from '@loopback/core';
import {DefaultCrudRepository, Options} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {FilesdbDataSource} from '../datasources';
import {Fileable, FileableRelations} from '../models';
import {FileableUserModifiableEntity} from '../models/fileable-user-modifiable-entity.model';

export class FileableRepository extends DefaultCrudRepository<
  Fileable,
  typeof Fileable.prototype.fileableId,
  FileableRelations
> {
  constructor(@inject('datasources.db') dataSource: FilesdbDataSource) {
    super(Fileable, dataSource);
  }

  async create(fileable: FileableUserModifiableEntity, options?: Options): Promise<Fileable> {
    const obj: Fileable = new Fileable();
    if (!fileable.id) throw new HttpErrors.UnprocessableEntity('Id is missing in the request parameters');
    obj.fileableId = fileable.id;
    obj.fileableType = fileable.fileableType;
    return super.create(obj, options);
  }

  async createAll(fileables: FileableUserModifiableEntity[]): Promise<Fileable[]> {
    const objs: Fileable[] = [];
    fileables.forEach(fileable => {
      const obj: Fileable = new Fileable();
      if (!fileable.id) return;
      obj.fileableId = fileable.id;
      obj.fileableType = fileable.fileableType;
      objs.push(obj);
    });
    return super.createAll(objs);
  }
}
