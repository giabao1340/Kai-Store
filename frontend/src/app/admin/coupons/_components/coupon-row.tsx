'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coupon } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface CouponRowProps {
  coupon: Coupon;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CouponRow({ coupon, onEdit, onDelete }: CouponRowProps) {
  const isExpired = new Date(coupon.endDate) < new Date();
  const isExhausted = !!coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

  const discountLabel = coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}%${coupon.maxDiscount ? ` (tối đa ${formatPrice(Number(coupon.maxDiscount))})` : ''}`
    : formatPrice(Number(coupon.discountValue));

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-mono font-medium text-sm text-gray-900">{coupon.code}</span>
        {coupon.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{coupon.description}</p>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{discountLabel}</td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {coupon.minOrderValue ? formatPrice(Number(coupon.minOrderValue)) : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
      </td>
      <td className="py-3 px-4 text-xs text-gray-400">
        {formatDate(coupon.startDate)} → {formatDate(coupon.endDate)}
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'text-xs px-2 py-1 rounded-full font-medium',
          !coupon.isActive
            ? 'bg-gray-100 text-gray-500'
            : isExpired
            ? 'bg-red-50 text-red-600'
            : isExhausted
            ? 'bg-orange-50 text-orange-600'
            : 'bg-green-50 text-green-700',
        )}>
          {!coupon.isActive ? 'Đã tắt' : isExpired ? 'Hết hạn' : isExhausted ? 'Hết lượt' : 'Hoạt động'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Sửa</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={onDelete}
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