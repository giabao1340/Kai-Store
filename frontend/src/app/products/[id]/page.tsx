import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductImages from "./_components/product-images";
import ProductActions from "./_components/product-actions";
import ProductList from "@/components/features/product/product-list";
import { fetchProductById, fetchProducts } from "@/services/product.service";
import ReviewList from "@/components/features/review/review-list";


interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

// SEO metadata động
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "Không tìm thấy — Kai Store" };

  return {
    title: `${product.name} — Kai Store`,
    description: product.description ?? `Mua ${product.name} tại Kai Store`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // Fetch song song product + related products
  const [product, relatedProducts] = await Promise.all([
    fetchProductById(id),
    fetchProducts({ limit: "4" }),
  ]);

  if (!product) notFound();

  // Lọc bỏ sản phẩm hiện tại khỏi related
  const related = relatedProducts.items.filter((p) => p.id !== id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-black transition-colors">
          Trang chủ
        </a>
        <span>/</span>
        <a href="/products" className="hover:text-black transition-colors">
          Sản phẩm
        </a>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Cột trái — Ảnh */}
        <ProductImages images={product.images} productName={product.name} />

        {/* Cột phải — Thông tin */}
        <div className="space-y-4">
          {/* Brand + Category */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              {product.brand?.name}
            </span>
            <span className="text-gray-200">·</span>
            <span className="text-sm text-gray-400">
              {product.category?.name}
            </span>
          </div>

          {/* Tên sản phẩm */}
          <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">
            {product.name}
          </h1>

          {/* Mô tả */}
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed">
              {product.description}
            </p>
          )}

          <hr className="border-gray-100" />

          {/* Chọn variant + thêm giỏ */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <div className="mt-16">
          <ProductList products={related} title="Có thể bạn thích" />
        </div>
      )}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Đánh giá sản phẩm
        </h2>
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}
