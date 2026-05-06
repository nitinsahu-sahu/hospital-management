// services/cloudinaryService.js
const { cloudinary } = require('../utils/cloudinary');
const streamifier = require('streamifier');
const path = require('path');

class CloudinaryService {
  constructor() {
    this.folderPrefix = 'ecommerce/products';
  }
  async uploadImage(buffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${this.folderPrefix}/${options.folder || 'general'}`,
            transformation: options.transformation || [
              { width: 800, height: 800, crop: 'limit', quality: 'auto' }
            ],
            format: options.format || 'webp',
            public_id: options.publicId,
            tags: options.tags || ['product'],
            ...options
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map((file, index) => {
        const customOptions = {
          ...options,
          publicId: options.publicIdPrefix 
            ? `${options.publicIdPrefix}_${index + 1}`
            : undefined,
          folder: options.folder 
            ? `${options.folder}/image_${index + 1}`
            : undefined
        };
        
        return this.uploadImage(file.buffer, customOptions);
      });
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple images upload error:', error);
      throw error;
    }
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return { success: true, message: 'Image deleted successfully' };
      } else {
        return { success: false, message: 'Image not found or already deleted' };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }
  async deleteMultipleImages(publicIds) {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
      const results = await Promise.all(deletePromises);
      
      return {
        success: results.every(r => r.success),
        results
      };
    } catch (error) {
      console.error('Multiple images delete error:', error);
      throw error;
    }
  }

  getOptimizedUrl(publicId, options = {}) {
    try {
      return cloudinary.url(publicId, {
        transformation: options.transformation || [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ],
        format: options.format || 'webp',
        secure: true
      });
    } catch (error) {
      console.error('Get URL error:', error);
      return publicId;
    }
  }

  async updateImage(oldPublicId, newBuffer, options = {}) {
    try {
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }
      
      const result = await this.uploadImage(newBuffer, options);
      return result;
    } catch (error) {
      console.error('Image update error:', error);
      throw error;
    }
  }

  extractPublicIdFromUrl(url) {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = parts.slice(parts.length - 2, parts.length - 1)[0];
      
      return `${this.folderPrefix}/${folder}/${publicId}`;
    } catch (error) {
      console.error('Extract public ID error:', error);
      return null;
    }
  }

  generateVariants(publicId) {
    return {
      original: this.getOptimizedUrl(publicId, { transformation: [] }),
      large: this.getOptimizedUrl(publicId, { 
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }] 
      }),
      medium: this.getOptimizedUrl(publicId, { 
        transformation: [{ width: 600, height: 600, crop: 'limit' }] 
      }),
      small: this.getOptimizedUrl(publicId, { 
        transformation: [{ width: 300, height: 300, crop: 'limit' }] 
      }),
      thumbnail: this.getOptimizedUrl(publicId, { 
        transformation: [{ width: 150, height: 150, crop: 'thumb', gravity: 'face' }] 
      })
    };
  }
}

module.exports = new CloudinaryService();