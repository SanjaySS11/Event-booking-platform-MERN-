import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImage = async (filePath, folder = "events") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;