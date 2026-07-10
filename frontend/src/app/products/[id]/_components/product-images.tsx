"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
interface ProductImagesProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImages({
  images,
  productName,
}: ProductImagesProps) {
  const primaryIndex = images.findIndex((img) => img.isPrimary);
  const [selected, setSelected] = useState(
    primaryIndex >= 0 ? primaryIndex : 0,
  );

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
        <span className="text-6xl">👟</span>
      </div>
    );
  }

  return (
    <div className=" flex justify-between">
      {/* Thumbnail */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelected(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                selected === index
                  ? "border-black"
                  : "border-transparent hover:border-gray-300",
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} ${index + 1}`}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Ảnh chính */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
        <PhotoProvider>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <PhotoView src={images[selected].url}>
              <div className="cursor-pointer h-full relative">
                <Image
                  src={images[selected].url}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </PhotoView>
          </div>
        </PhotoProvider>
      </div>
    </div>
  );
}
