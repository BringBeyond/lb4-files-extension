import {
  AuthUser,
  DefaultUserModifyCrudRepository,
  Entity,
  UserdbDataSource,
} from '@BringBeyond/lb4-base-extension';
import {
  AnyObject,
  Count,
  DataObject,
  Filter,
  Getter,
  Inclusion,
  InclusionFilter,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Options} from 'loopback-datasource-juggler';
import {FileableFileRepository, FileableRepository, FileRepository} from '.';
import {File, FileableFile} from '../models';
import {FileObject} from '../models/file-object.model';
import {FileableUserModifiableEntity} from '../models/fileable-user-modifiable-entity.model';
import {BlobstorageService} from '../services';

const debug = require('debug')('files:repository');

export abstract class FileableUserModifyCrudRepository<
  T extends FileableUserModifiableEntity,
  ID,
  Relations extends object = {},
> extends DefaultUserModifyCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: UserdbDataSource,
    protected readonly getCurrentUser: Getter<AuthUser | undefined>,
    protected readonly fileableType: string,
    protected readonly fileableRepo: FileableRepository,
    protected readonly fileableFileRepo: FileableFileRepository,
    protected readonly fileRepo: FileRepository,
    protected readonly blobstorageService: BlobstorageService,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }

  async addFiles(
    fileableId: FileableUserModifiableEntity | String,
    files: (File | String) | (File | String)[],
  ): Promise<FileableFile | FileableFile[]> {
    //let fileId: String;
    if (!(fileableId instanceof String) && fileableId.id)
      fileableId = fileableId.id;
    if (!Array.isArray(files)) files = [files];
    const fileableFiles: FileableFile[] = [];
    for (let file of files) {
      if (!(file instanceof String)) file = <string>file.id;
      fileableFiles.push(
        new FileableFile({
          fileableId: <string>fileableId,
          fileableType: this.fileableType,
          fileId: <string>file,
        }),
      );
    }
    return this.fileableFileRepo.createAll(fileableFiles);
  }

  async deleteFiles(
    fileableId: FileableUserModifiableEntity | String,
    files: File | String | (File | String)[],
  ): Promise<Count> {
    let fileId;
    const orFilter = [];
    if (!(fileableId instanceof String) && fileableId.id)
      fileableId = fileableId.id;
    if (!Array.isArray(files)) {
      files = [files];
    }
    if (files.length === 0) return {count: 0};
    for (const file of files) {
      if (file instanceof File) fileId = file.id;
      else fileId = file;
      orFilter.push({
        and: [
          {fileableId: <string>fileableId},
          {fileableType: this.fileableType},
          {fileId: <string>fileId},
        ],
      });
    }
    return this.fileableFileRepo.deleteAll({or: orFilter});
  }

  async create(
    entity: DataObject<T> & {
      fileObjects?: FileObject[];
      deleteFileObjects?: string[];
    },
    options?: Options,
  ): Promise<T> {
    let files: File[] = [];
    if (entity.fileObjects)
      files = await this.handleFileObjects(entity.fileObjects);
    entity.fileableType = this.fileableType;
    delete entity.fileObjects;
    delete entity.deleteFileObjects;
    const res = await super.create(entity, options);
    await this.fileableRepo.create(res);
    await this.addFiles(res, files);
    return res;
  }

  async createAll(
    entities: (DataObject<T> & {
      fileObjects?: FileObject[];
      deleteFileObjects?: string[];
    })[],
    options?: Options,
  ): Promise<T[]> {
    const res: T[] = [];
    for (const entity of entities) {
      res.push(await this.create(entity));
    }
    return res;
  }

  async update(
    entity: T & {fileObjects?: FileObject[]; deleteFileObjects?: string[]},
    options?: Options,
  ): Promise<void> {
    let files: File[] = [];
    if (entity.fileObjects)
      files = await this.handleFileObjects(entity.fileObjects);
    delete entity.fileObjects;
    if (entity.deleteFileObjects)
      await this.deleteFiles(entity, entity.deleteFileObjects);
    delete entity.deleteFileObjects;
    await this.addFiles(entity, files);
    return super.update(entity);
  }

  async updateById(
    id: ID,
    data: DataObject<T> & {
      fileObjects?: FileObject[];
      deleteFileObjects?: string[];
    },
    options?: Options,
  ): Promise<void> {
    let files: File[] = [];
    if (data.fileObjects)
      files = await this.handleFileObjects(data.fileObjects);
    delete data.fileObjects;
    if (data.deleteFileObjects)
      await this.deleteFiles(<String>(<unknown>id), data.deleteFileObjects);
    delete data.deleteFileObjects;
    await this.addFiles(<String>(<unknown>id), files);
    return super.updateById(id, data);
  }

  private async handleFileObjects(fileObjects: FileObject[]): Promise<File[]> {
    const files: File[] = [];
    const user = await this.getCurrentUser();
    let fileRecord;
    for (const fileObject of fileObjects) {
      debug(fileObject);
      fileRecord = await this.fileRepo.findOne({
        where: {fileId: fileObject.fileId},
      });
      debug(fileRecord);
      if (!fileRecord?.id) {
        throw new HttpErrors.NotFound();
      }
      // update File
      fileRecord.fileType =
        fileObject.fileType ?? fileRecord.fileType ?? 'attachment';
      fileRecord.tenantId = user?.defaultTenant ?? fileRecord.tenantId ?? '';
      await this.fileRepo.update(fileRecord);
      // upload File
      if (!fileRecord.blobSync)
        await this.blobstorageService.uploadFile(
          fileRecord,
          fileRecord.tenantId,
        );
      files.push(fileRecord);
    }
    return files;
  }

  async find(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const filters = this.splitInclusionFilter(filter);
    if (filters) {
      const resp = await super.find(filters?.fileableFilter, options);
      if (resp.length === 0) return resp;
      return this.includeFiles(resp, filters?.fileScopeFilter);
    } else return super.find(filter, options);
  }

  async findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    const filters = this.splitInclusionFilter(filter);
    if (filters) {
      const resp = await super.findOne(filters?.fileableFilter, options);
      if (resp === null) return resp;
      return this.includeFilesOne(resp, filters?.fileScopeFilter);
    } else return super.findOne(filter, options);
  }

  async findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const filters = this.splitInclusionFilter(filter);
    if (filters) {
      const resp = await super.findById(id, filters?.fileableFilter, options);
      return this.includeFilesOne(resp, filters?.fileScopeFilter);
    } else return super.findById(id, filter, options);
  }

  private splitInclusionFilter(filter?: Filter<T>) {
    if (filter?.include) {
      let fileScopeFilter: Filter<AnyObject> | undefined;
      const fileableIncludeFilter: InclusionFilter[] = [];
      for (const filterObj of filter.include) {
        if (
          filterObj === 'files' ||
          (<Inclusion>filterObj).relation === 'files'
        ) {
          fileScopeFilter = (<Inclusion>filterObj).scope;
        } else fileableIncludeFilter.push(filterObj);
      }
      filter.include = fileableIncludeFilter;
      return {fileableFilter: filter, fileScopeFilter: fileScopeFilter};
    } else return undefined;
  }

  //takes fileables and filter (file scope) and includes related files
  private async includeFilesOne(
    fileable: T & Relations,
    filter?: Filter<AnyObject>,
  ): Promise<T & Relations> {
    const filesFilter = {
      where: {
        fileableId: fileable?.id,
        fileableType: this.fileableType,
        deleted: false,
      },
      include: [{relation: 'file', scope: filter}],
    };
    const fileablesFilesRes = await this.fileableFileRepo.findAll(filesFilter);

    //filter fileableFile objects
    const fileableFiles = [];
    for (const fileableFile of fileablesFilesRes) {
      if (fileableFile.file)
        fileableFiles.push(Object.assign({}, fileableFile));
    }
    return Object.assign({fileableFiles: fileableFiles}, fileable);
  }

  //takes array of fileables and a filter (file scope) and includes files to corresponding fileable objects
  private async includeFiles(
    fileables: (T & Relations)[],
    filter?: Filter<AnyObject>,
  ): Promise<(T & Relations)[]> {
    //create orFiler to get fileableFiles from all fileables
    const orFilter = [];
    for (const fileable of fileables) {
      if (fileable.id)
        orFilter.push({
          fileableId: fileable.id,
          fileableType: this.fileableType,
          deleted: false,
        });
    }

    //create filter
    const filesFilter = {
      where: {or: orFilter},
      include: [{relation: 'file', scope: filter}],
    };
    const fileablesFilesRes = await this.fileableFileRepo.findAll(filesFilter);

    //insert all fileablesFiles into object for better finding
    const map: {[fileableId: string]: FileableFile[]} = {};
    for (const fileableFile of fileablesFilesRes) {
      if (map[fileableFile.fileableId]) {
        map[fileableFile.fileableId].push(Object.assign({}, fileableFile));
      }
      map[fileableFile.fileableId] = [Object.assign({}, fileableFile)];
    }

    //insert fileableFiles array to corresponding fileable object
    const fileablesRes: (T & Relations)[] = [];
    for (const fileable of fileables) {
      if (fileable.id)
        fileablesRes.push(
          Object.assign({fileableFiles: map[fileable.id]}, fileable),
        );
    }
    return fileablesRes;
  }
}
