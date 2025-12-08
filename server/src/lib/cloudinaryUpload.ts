import { cloudinary } from "../config/cloudinary";

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "mentor-profiles"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`📤 Starting upload: ${fileName} to folder ${folder}`);

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: folder,
        public_id: fileName.split(".")[0],
        overwrite: true,
        timeout: 30000, // 30 second timeout
      },
      (error, result) => {
        if (error) {
          console.error("❌ Upload error:", error);
          reject(error);
        } else {
          console.log("✅ Upload successful:", result?.secure_url);
          resolve(result?.secure_url || "");
        }
      }
    );

    stream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      reject(err);
    });

    // Write buffer directly to stream
    stream.write(fileBuffer);
    stream.end();
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
