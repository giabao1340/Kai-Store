import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  // Upload 1 ảnh
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `kai-store/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 1000, crop: 'limit' }, // giới hạn width 1000px
              { quality: 'auto' }, // tự tối ưu chất lượng
              { fetch_format: 'auto' }, // tự chọn format tốt nhất
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url); // trả về URL https
          },
        )
        .end(file.buffer);
    });
  }

  // Upload nhiều ảnh cùng lúc
  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    const uploads = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploads); // chạy song song
  }

  // Xóa ảnh trên Cloudinary
  async deleteImage(url: string): Promise<void> {
    // Lấy public_id từ URL
    // VD: https://res.cloudinary.com/demo/image/upload/kai-store/products/abc123.jpg
    // → public_id: kai-store/products/abc123
    const parts = url.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
  }
}
