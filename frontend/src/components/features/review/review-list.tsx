"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { reviewService, Review } from "@/services/review.service";
import StarRating from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";

interface ReviewListProps {
  productId: string;
  refresh?: number; // tăng giá trị này để trigger refetch
}

export default function ReviewList({ productId, refresh }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, refresh]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getByProduct(productId);
      setReviews(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính điểm trung bình
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Chưa có đánh giá nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tổng quan */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">
            {avgRating.toFixed(1)}
          </p>
          <StarRating value={Math.round(avgRating)} readonly size="sm" />
          <p className="text-xs text-gray-400 mt-1">
            {reviews.length} đánh giá
          </p>
        </div>

        {/* Phân bố sao */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percent =
              reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3">{star}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danh sách reviews */}
      <div className="space-y-4 divide-y divide-gray-50">
        {reviews.map((review) => (
          <div key={review.id} className="pt-4 first:pt-0">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {review.user.avatarUrl ? (
                  <Image
                    src={review.user.avatarUrl}
                    alt={review.user.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-medium text-gray-500">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {review.user.name}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.isVerified && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Đã mua hàng
                    </span>
                  )}
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
