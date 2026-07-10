"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { reviewService } from "@/services/review.service";

interface ReviewFormProps {
  productId: string;
  productName: string;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
}

export default function ReviewForm({
  productId,
  productName,
  orderId,
  onSuccess,
  onCancel,
  existingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingReview;

  const RATING_LABELS: Record<number, string> = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Xuất sắc",
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await reviewService.update(existingReview.id, { rating, comment });
        toast.success("Cập nhật đánh giá thành công");
      } else {
        await reviewService.create({ productId, orderId, rating, comment });
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tên sản phẩm */}
      <p className="text-sm text-gray-500 line-clamp-1">{productName}</p>

      {/* Star rating */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Đánh giá của bạn</p>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-sm text-gray-500">
              {RATING_LABELS[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Nhận xét <span className="text-gray-400 font-normal">(tùy chọn)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-full"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="flex-1 rounded-full"
        >
          {isSubmitting
            ? "Đang gửi..."
            : isEditing
              ? "Cập nhật"
              : "Gửi đánh giá"}
        </Button>
      </div>
    </div>
  );
}
