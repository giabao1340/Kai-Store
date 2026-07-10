import ProductItem from './product-item';
import { Product } from '@/types';
import { productAdminService } from "@/services/product.service";

interface ProductListProps {
  products: Product[];
  title?: string;
  viewAllHref?: string;
}

export default function ProductList({
  products,
  title,
  viewAllHref,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        Không có sản phẩm nào
      </div>
    );
  }

  

  return (
    <section className="w-full">
      {/* Header section */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Xem tất cả →
            </a>
          )}
        </div>
      )}

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}