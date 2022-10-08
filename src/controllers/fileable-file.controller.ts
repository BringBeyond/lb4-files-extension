import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {FileableFile} from '../models';
import {FileableFileRepository} from '../repositories';

export class FileableFileController {
  constructor(
    @repository(FileableFileRepository)
    public fileableFileRepository: FileableFileRepository,
  ) { }

  @authenticate(STRATEGY.BEARER)
  // @authorize({permissions: [PermissionKey.CreateFileableFile]})
  @post('/fileable-files')
  @response(200, {
    description: 'FileableFile model instance',
    content: {'application/json': {schema: getModelSchemaRef(FileableFile)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FileableFile, {
            title: 'NewFileableFile',
            exclude: ['id'],
          }),
        },
      },
    })
    fileableFile: Omit<FileableFile, 'id'>,
  ): Promise<FileableFile> {
    return this.fileableFileRepository.create(fileableFile);
  }

  @authenticate(STRATEGY.BEARER)
  // @authorize({permissions: [PermissionKey.ViewFileableFile]})
  @get('/fileable-files/count')
  @response(200, {
    description: 'FileableFile model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(FileableFile) where?: Where<FileableFile>,
  ): Promise<Count> {
    return this.fileableFileRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  // @authorize({permissions: [PermissionKey.ViewFileableFile]})
  @get('/fileable-files')
  @response(200, {
    description: 'Array of FileableFile model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(FileableFile, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(FileableFile) filter?: Filter<FileableFile>,
  ): Promise<FileableFile[]> {
    const resp = await this.fileableFileRepository.find(filter);
    return resp.map(elem => Object.assign({file: elem.file}, elem))
  }

  // @authorize({permissions: [PermissionKey.UpdateFileableFile]})
  @patch('/fileable-files')
  @response(200, {
    description: 'FileableFile PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FileableFile, {partial: true}),
        },
      },
    })
    fileableFile: FileableFile,
    @param.where(FileableFile) where?: Where<FileableFile>,
  ): Promise<Count> {
    return this.fileableFileRepository.updateAll(fileableFile, where);
  }

  // @authorize({permissions: [PermissionKey.ViewFileableFile]})
  @get('/fileable-files/{id}')
  @response(200, {
    description: 'FileableFile model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(FileableFile, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(FileableFile, {exclude: 'where'}) filter?: FilterExcludingWhere<FileableFile>
  ): Promise<FileableFile> {
    const res = await this.fileableFileRepository.findById(id, filter);
    return Object.assign({file: res.file}, res)
  }

  // @authorize({permissions: [PermissionKey.UpdateFileableFile]})
  @patch('/fileable-files/{id}')
  @response(204, {
    description: 'FileableFile PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FileableFile, {partial: true}),
        },
      },
    })
    fileableFile: FileableFile,
  ): Promise<void> {
    await this.fileableFileRepository.updateById(id, fileableFile);
  }

  // @authorize({permissions: [PermissionKey.UpdateFileableFile]})
  @put('/fileable-files/{id}')
  @response(204, {
    description: 'FileableFile PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() fileableFile: FileableFile,
  ): Promise<void> {
    await this.fileableFileRepository.replaceById(id, fileableFile);
  }

  // @authorize({permissions: [PermissionKey.DeleteFileableFile]})
  @del('/fileable-files/{id}')
  @response(204, {
    description: 'FileableFile DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.fileableFileRepository.deleteById(id);
  }
}
