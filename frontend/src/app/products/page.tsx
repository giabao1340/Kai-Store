import { Suspense } from "react";
import ProductFilter from "./_components/product-filter";
import ProductGrid from "./_components/product-grid";
import { fetchProducts, type ProductQuery } from "@/services/product.service";
import { fetchBrands } from "@/services/brand.service";
import { fetchCategories } from "@/services/category.service";

interface ProductsPageProps {
  searchParams: Promise<ProductQuery>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await searchParams;

  // Fetch song song
  const [products, brands, categories] = await Promise.all([
    fetchProducts(query),
    fetchBrands(),
    fetchCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {query.isFeatured === "true" ? "Sản phẩm nổi bật" : "Tất cả sản phẩm"}
        </h1>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <ProductFilter
            brands={brands}
            categories={categories}
            totalProducts={products.total}
          />
        </Suspense>
      </div>
      <ProductGrid products={products.items} />
    </div>
  );
}

// Metadata động theo filter
export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  return {
    title: query.search
      ? `Tìm kiếm "${query.search}" — Kai Store`
      : "Sản phẩm — Kai Store",
  };
}
