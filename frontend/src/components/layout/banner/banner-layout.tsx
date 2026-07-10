"use client";

import useEmblaCarousel from "embla-carousel-autoplay";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Banner } from "@/types/banner.type";
import { bannerService } from "@/services/banner.service";

const BannerLayout = () => {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await bannerService.getAll();
      setBanners(data);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full">
      <Carousel
        plugins={[plugin.current]}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              {/* ✅ relative container chứa cả ảnh và text */}
              <div className="relative h-[250px] w-full sm:h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden">
                {/* ✅ Image nằm trong relative div */}
                <Image
                  src={banner.imageUrl}
                  alt={`Banner ${index + 1}`}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />

                {/* ✅ Overlay tối để text dễ đọc */}
                <div className="absolute inset-0 bg-black/40 z-10" />

                {/* ✅ Text nằm absolute trên ảnh */}
                <div className="absolute bottom-10 left-8 z-20 text-white space-y-2 md:left-16 md:bottom-14">
                  <span className="text-sm font-medium tracking-widest uppercase opacity-80">
                    {banner.title}
                  </span>
                  <h2 className="text-3xl font-bold md:text-5xl">
                    {banner.subtitle}
                  </h2>
                  <p className="text-sm opacity-80 md:text-base">
                    {banner.description}
                  </p>
                  <Button className="mt-4 bg-white text-black hover:bg-gray-100 rounded-full px-6">
                    Mua ngay →
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 z-20 bg-white/20 border-white/30 text-white hover:bg-white/40" />
        <CarouselNext className="right-4 z-20 bg-white/20 border-white/30 text-white hover:bg-white/40" />
      </Carousel>
    </div>
  );
};

export default BannerLayout;
