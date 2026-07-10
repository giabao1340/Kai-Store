"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { MoreHorizontal, Star, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { reviewService, Review } from "@/services/review.service";
import { formatDate, cn } from "@/lib/utils";

interface ReviewRowProps {
  review: Review;
  onUpdated: () => void;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewRow({ review, onUpdated }: ReviewRowProps) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await reviewService.approve(review.id);
      toast.success("Đã duyệt đánh giá");
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await reviewService.remove(review.id);
      toast.success("Đã xóa đánh giá");
      onUpdated();
    } catch {
      toast.error("Không thể xóa đánh giá");
    }
  };

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      {/* User */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {review.user.avatarUrl ? (
              <Image
                src={review.user.avatarUrl}
                alt={review.user.name}
                fill
                className="object-cover"
                sizes="28px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-medium text-gray-500">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {review.user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {review.user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Sản phẩm */}
      <td className="py-3 px-4">
        <p className="text-sm text-gray-700 line-clamp-1">
          {review.product.name}
        </p>
      </td>

      {/* Sao */}
      <td className="py-3 px-4">
        <StarDisplay rating={review.rating} />
      </td>

      {/* Nhận xét */}
      <td className="py-3 px-4 max-w-xs">
        <p className="text-sm text-gray-600 line-clamp-2">
          {review.comment || (
            <span className="text-gray-300 italic">Không có nhận xét</span>
          )}
        </p>
      </td>

      {/* Ngày */}
      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
        {formatDate(review.createdAt)}
      </td>

      {/* Trạng thái */}
      <td className="py-3 px-4">
        {review.isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
            <Check className="w-3 h-3" />
            Đã duyệt
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium">
            Chờ duyệt
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!review.isVerified && (
                <DropdownMenuItem
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="text-green-600 focus:text-green-600"
                >
                  {isApproving ? "Đang duyệt..." : "Duyệt"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={handleDelete}
                className="text-red-500 focus:text-red-500"
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
