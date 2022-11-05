# lb4-files-extension

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Installation

Install Lb4FilesExtensionComponent using `npm`;

```sh
$ [npm install | yarn add] lb4-files-extension
```

## Needed Permissions

```ts
export const enum PermissionKey {
  ViewFile = 'ViewFile',
  CreateFile = 'CreateFile',
  DeleteFile = 'DeleteFile',

  ViewFileableFile = 'ViewFileableFile',
  CreateFileableFile = 'CreateFileableFile',
  UpdateFileableFile = 'UpdateFileableFile',
  DeleteFileableFile = 'DeleteFileableFile',
}
```

## Basic Use

Configure and load Lb4FilesExtensionComponent in the application constructor
as shown below.

```ts
import {Lb4FilesExtensionComponent, Lb4FilesExtensionComponentOptions, DEFAULT_LB4_FILES_EXTENSION_OPTIONS} from 'lb4-files-extension';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: Lb4FilesExtensionComponentOptions = DEFAULT_LB4_FILES_EXTENSION_OPTIONS;
    this.configure(Lb4FilesExtensionComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(Lb4FilesExtensionComponent);
    // ...
  }
  // ...
}
```
