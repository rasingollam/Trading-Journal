import * as Minio from "minio";
import { config } from "../config.js";
export const minioClient = new Minio.Client({
    endPoint: config.minioEndpoint.split(":")[0],
    port: parseInt(config.minioEndpoint.split(":")[1] || "9000", 10),
    useSSL: config.minioUseSSL,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey,
});
export async function ensureBucket() {
    const exists = await minioClient.bucketExists(config.minioBucket);
    if (!exists) {
        await minioClient.makeBucket(config.minioBucket);
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${config.minioBucket}/*`],
                },
            ],
        };
        await minioClient.setBucketPolicy(config.minioBucket, JSON.stringify(policy));
    }
}
export async function uploadFile(buffer, objectName, contentType) {
    await minioClient.putObject(config.minioBucket, objectName, buffer, buffer.length, { "Content-Type": contentType });
    return objectName;
}
export async function deleteFile(objectName) {
    try {
        await minioClient.removeObject(config.minioBucket, objectName);
    }
    catch {
    }
}
export function getFileUrl(objectName) {
    return `/api/files/${objectName}`;
}
//# sourceMappingURL=storage.js.map