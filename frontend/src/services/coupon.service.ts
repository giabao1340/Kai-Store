import api from './api';
import { Coupon } from '@/types';

export const couponService = {
  getAll: (isActive?: boolean) =>
    api.get<Coupon[]>('/coupons', { params: { isActive } }),
  getOne: (id: string) => api.get<Coupon>(`/coupons/${id}`),
  create: (dto: any) => api.post<Coupon>('/coupons', dto),
  update: (id: string, dto: any) => api.patch<Coupon>(`/coupons/${id}`, dto),
  remove: (id: string) => api.delete(`/coupons/${id}`),
};