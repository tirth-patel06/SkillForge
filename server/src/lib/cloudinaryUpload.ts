// server/src/lib/cloudinaryUpload.ts
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

export function uploadBufferToCloudinary(
buffer: Buffer, folder: string = "uploads", p0: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error: any, result: any) => {
        if (error) {
          return reject(error);
        }
        if (!result || !result.secure_url) {
          return reject(new Error("No result from Cloudinary"));
        }
        resolve(result.secure_url);
      }
    );

    const stream = Readable.from(buffer);

    stream.on("error", (err: any) => {
      reject(err);
    });

    stream.pipe(uploadStream);
  });
}
