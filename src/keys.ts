import {BindingKey, CoreBindings} from '@loopback/core';
import {Lb4FilesExtensionComponent} from './component';
import {BlobstorageService} from './services';
import {FileUploadHandler} from './types';

/**
 * Binding keys used by this component.
 */
export namespace Lb4FilesExtensionComponentBindings {
  export const COMPONENT = BindingKey.create<Lb4FilesExtensionComponent>(
    `${CoreBindings.COMPONENTS}.Lb4FilesExtensionComponent`,
  );
}

/**
 * Binding key for the file upload provider
 */
export const FILE_UPLOAD_SERVICE = BindingKey.create<FileUploadHandler>('services.FileUpload');

/**
 * Binding key for the storage directory
 */
export const STORAGE_DIRECTORY = BindingKey.create<string>('storage.directory');

/**
 * Binding key for the blop service
 */
export const BLOB_SERVICE = BindingKey.create<BlobstorageService>('services.Blobstorage');

