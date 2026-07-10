import ProductItem from "@/components/features/product/product-item";
import { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
      // ← thêm !products check
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">👟</span>
          <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào</p>
        </div>
      );
    }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
