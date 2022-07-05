import {Getter, inject} from '@loopback/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {FilesdbDataSource} from '../datasources';
import {File, FileRelations} from '../models';
import {AuthUser} from '@BringBeyond/lb4-base-extension';
import {DefaultUserModifyCrudRepository} from '@BringBeyond/lb4-base-extension';

export class FileRepository extends DefaultUserModifyCrudRepository<File, typeof File.prototype.id, FileRelations> {
  constructor(
    @inject('datasources.db') dataSource: FilesdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser | undefined>,
  ) {
    super(File, dataSource, getCurrentUser);
  }
}
