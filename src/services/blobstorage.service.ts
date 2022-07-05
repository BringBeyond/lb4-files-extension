/*
 * File: blobstorage.service.ts
 * Project: oncycle-backend
 * File Created: Wednesday, 26th January 2022 3:25:35 pm
 * Author: Max Kirschning
 * -----
 * Last Modified: Wednesday, 26th January 2022 3:54:45 pm
 * Modified By: Max Kirschning
 * -----
 * Copyright 2022, Bahr Rauh Kirschning UG
 */

import {BlobSASPermissions, BlobServiceClient, generateBlobSASQueryParameters, StorageSharedKeyCredential} from '@azure/storage-blob';
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as fs from 'fs-extra';
import {File} from '../models';
import {FileRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class BlobstorageService {
  constructor(
    @repository(FileRepository)
    public fileRepository: FileRepository,
  ) { }

  /*
   * Add service methods here
   */
  async uploadFile(file: File, tenant: string) {
    // Get the block service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CS ?? '');

    // Get the tenant container
    const containerClient = blobServiceClient.getContainerClient(tenant);

    // TODO: validate filetTypes
    // Get the blob
    const blockBlobClient = containerClient.getBlockBlobClient(`${file.fileType}/${file.filename}`);

    // TODO: Catch errors here!
    // Upload file to Blob storage
    await blockBlobClient.uploadFile(`temp/${file.filename}`, {blobHTTPHeaders: {blobContentType: file.mimetype}});

    // TODO: Use enums here and check the request for right values.
    await this.fileRepository.updateById(file.id, {blobSync: true});

    // TODO: Create check if thats really save to do
    // Delete the file from the temp folder
    await fs.remove(`temp/${file.filename}`);

    // TODO: Return some usefull error messages
  }

  async downloadFile(file: File, tenant: string) {
    // Get the block service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_BLOB_CS ?? '');
    const cerds = new StorageSharedKeyCredential(process.env.AZURE_BLOB_AN ?? '', process.env.AZURE_BLOB_KEY ?? '');


    const containerClient = blobServiceClient.getContainerClient(file.tenantId ?? tenant);

    const sasOptions = {
      containerName: containerClient.containerName,
      blobName: `${file.fileType}/${file.filename}`,
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      permissions: BlobSASPermissions.parse('r'),
      contentDisposition: `attachment; filename="${file.originalname}"`,
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, cerds).toString();

    return `${containerClient.getBlockBlobClient(`${file.fileType}/${file.filename}`).url}?${sasToken}`;
  }

  protected getBlobServiceClient() {
    return;
  }
}
