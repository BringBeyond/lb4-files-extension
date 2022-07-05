import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {AuthenticationBindings} from 'loopback4-authentication';
import {FileRepository} from '.';
import {FilesdbDataSource} from '../datasources';
import {File, FileableFile, FileableFileRelations} from '../models';
import {AuthUser} from '@BringBeyond/lb4-base-extension';
import {DefaultUserModifyCrudRepository} from '@BringBeyond/lb4-base-extension';

export class FileableFileRepository extends DefaultUserModifyCrudRepository<
  FileableFile,
  typeof FileableFile.prototype.id,
  FileableFileRelations
> {
  public readonly file: BelongsToAccessor<File, typeof FileableFile.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: FilesdbDataSource,
    @repository.getter(FileRepository)
    fileRepositoryGetter: Getter<FileRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    protected readonly getCurrentUser: Getter<AuthUser | undefined>,
    // @repository.getter('FileRepository') protected fileRepositoryGetter: Getter<FileRepository>,
  ) {
    super(FileableFile, dataSource, getCurrentUser);
    this.file = this.createBelongsToAccessorFor('file_id', fileRepositoryGetter);
    this.registerInclusionResolver('file', this.file.inclusionResolver);
  }
}
