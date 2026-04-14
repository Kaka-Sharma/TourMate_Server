const cloudinary = require("../config/cloudinary");

// upload buffer => cloudinary
const streamUpload = (buffer, folder = "general") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// delete image
const deleteImage = (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = {
  streamUpload,
  deleteImage,
};