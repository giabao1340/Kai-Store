"use client";

import { useEffect, useState } from "react";
import { reviewService, Review } from "@/services/review.service";
import ReviewRow from "./_components/review-row";

const TABS = [
  { label: "Tất cả", value: undefined },
  { label: "Chờ duyệt", value: false },
  { label: "Đã duyệt", value: true },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getAll(activeTab);
      setReviews(data);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isVerified).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Đánh giá sản phẩm</h1>
          {pendingCount > 0 && (
            <span className="text-xs bg-yellow-50 text-yellow-700 font-medium px-2 py-1 rounded-full">
              {pendingCount} chờ duyệt
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Không có đánh giá nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Người dùng
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Sản phẩm
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Sao
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Nhận xét
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Ngày
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onUpdated={fetchReviews}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
