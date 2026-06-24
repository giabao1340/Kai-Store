import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed data...');

  // ── Xóa data cũ theo đúng thứ tự (tránh lỗi FK) ──
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // ── Tạo Brands ────────────────────────────────────
  const nike = await prisma.brand.create({
    data: {
      name: 'Nike',
      slug: 'nike',
      description: 'Just Do It',
      isActive: true,
    },
  });

  const adidas = await prisma.brand.create({
    data: {
      name: 'Adidas',
      slug: 'adidas',
      description: 'Impossible is Nothing',
      isActive: true,
    },
  });

  const converse = await prisma.brand.create({
    data: {
      name: 'Converse',
      slug: 'converse',
      description: 'Shoes are boring. Wear sneakers.',
      isActive: true,
    },
  });

  console.log('✅ Brands:', nike.name, adidas.name, converse.name);

  // ── Tạo Categories ────────────────────────────────
  const sneakers = await prisma.category.create({
    data: {
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Giày thể thao năng động',
      isActive: true,
    },
  });

  const running = await prisma.category.create({
    data: {
      name: 'Chạy bộ',
      slug: 'chay-bo',
      description: 'Giày chuyên dụng cho chạy bộ',
      isActive: true,
    },
  });

  const casual = await prisma.category.create({
    data: {
      name: 'Casual',
      slug: 'casual',
      description: 'Giày thường ngày thoải mái',
      isActive: true,
    },
  });

  console.log('✅ Categories:', sneakers.name, running.name, casual.name);

  // ── Tạo Products + Variants ───────────────────────

  // Nike Air Force 1
  const airForce = await prisma.product.create({
    data: {
      name: 'Nike Air Force 1',
      slug: 'nike-air-force-1',
      description:
        'Đôi giày huyền thoại với thiết kế cổ điển, phù hợp mọi outfit.',
      brandId: nike.id,
      categoryId: sneakers.id,
      isActive: true,
      isFeatured: true,
      variants: {
        create: [
          {
            size: '39',
            color: 'Trắng',
            sku: 'NK-AF1-WHT-39',
            price: 2800000,
            compareAtPrice: 3200000,
            stock: 10,
          },
          {
            size: '40',
            color: 'Trắng',
            sku: 'NK-AF1-WHT-40',
            price: 2800000,
            compareAtPrice: 3200000,
            stock: 15,
          },
          {
            size: '41',
            color: 'Trắng',
            sku: 'NK-AF1-WHT-41',
            price: 2800000,
            compareAtPrice: 3200000,
            stock: 8,
          },
          {
            size: '40',
            color: 'Đen',
            sku: 'NK-AF1-BLK-40',
            price: 2800000,
            stock: 12,
          },
          {
            size: '41',
            color: 'Đen',
            sku: 'NK-AF1-BLK-41',
            price: 2800000,
            stock: 5,
          },
        ],
      },
    },
  });

  // Nike Air Max 270
  const airMax = await prisma.product.create({
    data: {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description:
        'Đệm khí Air Max lớn nhất từ trước đến nay, êm ái tuyệt vời.',
      brandId: nike.id,
      categoryId: running.id,
      isActive: true,
      isFeatured: true,
      variants: {
        create: [
          {
            size: '40',
            color: 'Đen/Đỏ',
            sku: 'NK-AM270-BKRD-40',
            price: 3500000,
            compareAtPrice: 4000000,
            stock: 7,
          },
          {
            size: '41',
            color: 'Đen/Đỏ',
            sku: 'NK-AM270-BKRD-41',
            price: 3500000,
            compareAtPrice: 4000000,
            stock: 9,
          },
          {
            size: '42',
            color: 'Đen/Đỏ',
            sku: 'NK-AM270-BKRD-42',
            price: 3500000,
            compareAtPrice: 4000000,
            stock: 4,
          },
          {
            size: '41',
            color: 'Trắng/Xanh',
            sku: 'NK-AM270-WTBL-41',
            price: 3500000,
            stock: 11,
          },
        ],
      },
    },
  });

  // Adidas Ultraboost 22
  const ultraboost = await prisma.product.create({
    data: {
      name: 'Adidas Ultraboost 22',
      slug: 'adidas-ultraboost-22',
      description:
        'Công nghệ Boost mang lại năng lượng phản hồi tối đa khi chạy.',
      brandId: adidas.id,
      categoryId: running.id,
      isActive: true,
      isFeatured: false,
      variants: {
        create: [
          {
            size: '39',
            color: 'Xanh Navy',
            sku: 'AD-UB22-NVY-39',
            price: 4200000,
            compareAtPrice: 5000000,
            stock: 6,
          },
          {
            size: '40',
            color: 'Xanh Navy',
            sku: 'AD-UB22-NVY-40',
            price: 4200000,
            compareAtPrice: 5000000,
            stock: 8,
          },
          {
            size: '41',
            color: 'Xanh Navy',
            sku: 'AD-UB22-NVY-41',
            price: 4200000,
            compareAtPrice: 5000000,
            stock: 3,
          },
          {
            size: '40',
            color: 'Trắng',
            sku: 'AD-UB22-WHT-40',
            price: 4200000,
            stock: 10,
          },
        ],
      },
    },
  });

  // Adidas Stan Smith
  const stanSmith = await prisma.product.create({
    data: {
      name: 'Adidas Stan Smith',
      slug: 'adidas-stan-smith',
      description: 'Biểu tượng thời trang với thiết kế tối giản và sang trọng.',
      brandId: adidas.id,
      categoryId: casual.id,
      isActive: true,
      isFeatured: true,
      variants: {
        create: [
          {
            size: '38',
            color: 'Trắng/Xanh lá',
            sku: 'AD-SS-WTGR-38',
            price: 2500000,
            stock: 14,
          },
          {
            size: '39',
            color: 'Trắng/Xanh lá',
            sku: 'AD-SS-WTGR-39',
            price: 2500000,
            stock: 20,
          },
          {
            size: '40',
            color: 'Trắng/Xanh lá',
            sku: 'AD-SS-WTGR-40',
            price: 2500000,
            stock: 18,
          },
          {
            size: '41',
            color: 'Trắng/Xanh lá',
            sku: 'AD-SS-WTGR-41',
            price: 2500000,
            stock: 9,
          },
        ],
      },
    },
  });

  // Converse Chuck Taylor
  const chuckTaylor = await prisma.product.create({
    data: {
      name: 'Converse Chuck Taylor All Star',
      slug: 'converse-chuck-taylor-all-star',
      description: 'Đôi giày canvas kinh điển đã tồn tại hơn 100 năm.',
      brandId: converse.id,
      categoryId: casual.id,
      isActive: true,
      isFeatured: false,
      variants: {
        create: [
          {
            size: '38',
            color: 'Đen',
            sku: 'CV-CT-BLK-38',
            price: 1500000,
            compareAtPrice: 1800000,
            stock: 25,
          },
          {
            size: '39',
            color: 'Đen',
            sku: 'CV-CT-BLK-39',
            price: 1500000,
            compareAtPrice: 1800000,
            stock: 30,
          },
          {
            size: '40',
            color: 'Đen',
            sku: 'CV-CT-BLK-40',
            price: 1500000,
            compareAtPrice: 1800000,
            stock: 22,
          },
          {
            size: '39',
            color: 'Đỏ',
            sku: 'CV-CT-RED-39',
            price: 1500000,
            stock: 15,
          },
          {
            size: '40',
            color: 'Đỏ',
            sku: 'CV-CT-RED-40',
            price: 1500000,
            stock: 12,
          },
        ],
      },
    },
  });

  console.log(
    '✅ Products:',
    airForce.name,
    airMax.name,
    ultraboost.name,
    stanSmith.name,
    chuckTaylor.name,
  );
  console.log('🎉 Seed data hoàn thành!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
