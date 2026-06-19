import * as Minio from "minio";
export declare const minioClient: Minio.Client;
export declare function ensureBucket(): Promise<void>;
export declare function uploadFile(buffer: Buffer, objectName: string, contentType: string): Promise<string>;
export declare function deleteFile(objectName: string): Promise<void>;
export declare function getFileUrl(objectName: string): string;
//# sourceMappingURL=storage.d.ts.map