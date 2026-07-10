import ProductList from "@/components/features/product/product-list";
import BannerLayout from "@/components/layout/banner/banner-layout";

// Hàm fetch phía server — không cần axios
async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?isFeatured=true&limit=8`,
      { next: { revalidate: 60 } }, // cache 60 giây
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getLatestProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  // Fetch song song 2 API
  const [featuredProducts, latestProducts] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
  ]);

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Banner */}
      <BannerLayout />

      <div className="container mx-auto px-4 space-y-12">
        {/* Sản phẩm nổi bật */}
        <ProductList
          products={featuredProducts.items}
          title="Nổi bật"
          viewAllHref="/products?isFeatured=true"
        />

        {/* Sản phẩm mới nhất */}
        <ProductList
          products={latestProducts.items}
          title="Mới nhất"
          viewAllHref="/products"
        />
      </div>
    </div>
  );
}
