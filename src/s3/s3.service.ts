import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  private S3: AWS.S3;
  private readonly BUCKET: string;
  private readonly folderBase: string;
  constructor() {
    this.S3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
      region: process.env.AWS_REGION,
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
    this.BUCKET = process.env.AWS_BUCKET_NAME;
    this.folderBase = 'action-analysis';
  }

  makeUniqueFileName = (originalName: string): string => {
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const uniqueId = uuidv4();
    return `${nameWithoutExt}-${uniqueId}${extension}`;
  };

  /** Internal helper */
  private async uploadToS3(
    key: string,
    body: Buffer,
    contentType: string,
    filename: string,
  ): Promise<void> {
    await this.S3.putObject({
      Bucket: this.BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentDisposition: `inline; filename="${filename}"`,
    }).promise();

    this.logger.log(`Uploaded ${key}`);
  }

  /** Upload a Multer file buffer */
  async uploadAudio(file: Express.Multer.File): Promise<string> {
    const filename = this.makeUniqueFileName(file.originalname);
    const objectKey = `${this.folderBase}/${filename}`;
    await this.uploadToS3(objectKey, file.buffer, file.mimetype, filename);
    return objectKey;
  }

  /** Convert an objectKey to your public CDN URL */
  async getAudioUrl(objectKey: string): Promise<string> {
    return `${process.env.AWS_CDN}/${objectKey}`;
  }

  /** Fetch an external image and store it on S3 */
  async saveAudioFromUrl(audioUrl: string): Promise<string> {
    const filename = this.makeUniqueFileName(
      audioUrl.split('/').pop() || 'audio.mp3',
    );
    const objectKey = `${this.folderBase}/${filename}`;

    const { data, headers } = await axios.get<ArrayBuffer>(audioUrl, {
      responseType: 'arraybuffer',
    });

    await this.uploadToS3(
      objectKey,
      Buffer.from(data),
      headers['content-type'] ?? 'application/octet-stream',
      filename,
    );

    return objectKey;
  }

  /** Generate a one‑hour presigned URL (GET) */
  async generatePresignedGetUrl(objectKey: string): Promise<string> {
    return this.S3.getSignedUrlPromise('getObject', {
      Bucket: this.BUCKET,
      Key: objectKey,
      Expires: 3600,
    });
  }

  async generatePresignedPutUrl(
    file: Express.Multer.File,
  ): Promise<{ presignedUrl: string; objectKey: string }> {
    const filename = this.makeUniqueFileName(file.originalname);
    const objectKey = `${this.folderBase}/${filename}`;
    const presignedUrl = await this.S3.getSignedUrlPromise('putObject', {
      Bucket: this.BUCKET,
      Key: objectKey,
      Expires: 3600,
    });
    return { presignedUrl, objectKey };
  }

  /** Generate a presigned PUT URL from a filename (server-side uploads) */
  async generatePresignedPutUrlFromName(
    originalName: string,
  ): Promise<{ presignedUrl: string; objectKey: string; filename: string }> {
    try {
      const filename = this.makeUniqueFileName(originalName);
      const objectKey = `${this.folderBase}/${filename}`;
      const presignedUrl = await this.S3.getSignedUrlPromise('putObject', {
        Bucket: this.BUCKET,
        Key: objectKey,
        Expires: 3600,
        // Do not sign any additional headers to avoid mismatch with the client
        // ContentType: contentType,
        // ContentDisposition: `inline; filename="${filename}"`,
      });
      return { presignedUrl, objectKey, filename };
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error}`);
      return { presignedUrl: '', objectKey: '', filename: '' };
    }
  }
}
