import {RequestHandler} from 'express-serve-static-core';

export type FileUploadHandler = RequestHandler;

/**
* Interface defining the component's options object
*/
export interface Lb4FilesExtensionComponentOptions {
  // Add the definitions here
  fileStorageDirectory: string,
}

/**
* Default options for the component
*/
export const DEFAULT_LB4_FILES_EXTENSION_OPTIONS: Lb4FilesExtensionComponentOptions = {
  // Specify the values here
  fileStorageDirectory: '../temp'
};

