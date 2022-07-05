import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  ControllerClass,
} from '@loopback/core';
import { FileableFileRepository, FileableRepository, FileRepository, FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY } from '.';
import {Lb4FilesExtensionComponentBindings} from './keys'
import { BlobstorageService } from './services';
import {DEFAULT_LB4_FILES_EXTENSION_OPTIONS, Lb4FilesExtensionComponentOptions} from './types';
import multer from 'multer'
import {v4 as uuidv4} from 'uuid';
import { FileableFileController, FileController } from './controllers';
import { FileUploadProvider } from '.';

// Configure the binding for Lb4FilesExtensionComponent
@injectable({tags: {[ContextTags.KEY]: Lb4FilesExtensionComponentBindings.COMPONENT}})
export class Lb4FilesExtensionComponent implements Component {

  controllers = [FileController, FileableFileController];
  services = [FileUploadProvider]
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application & {repository: (repoClass: object)=>{}, dataSource: (repoClass: object)=>{}},
    @config()
    private options: Lb4FilesExtensionComponentOptions = DEFAULT_LB4_FILES_EXTENSION_OPTIONS,
  ) {
    // mixin repositories
    application.repository(FileRepository)
    application.repository(FileableRepository)
    application.repository(FileableFileRepository)
    // bind Blobstorage service
    application.bind('services.Blobstorage').toClass(BlobstorageService);
    // Configure file upload with multer options
    this.configureFileUpload();

  }

  protected configureFileUpload() {
    // Upload files to `dist/.sandbox` by default
    let destination = this.options.fileStorageDirectory
    this.application.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name as is
        filename: (req, file, cb) => {
          cb(null, uuidv4() + '_' + file.originalname);
        },
      }),
    };
    // Configure the file upload service with multer options
    this.application.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
