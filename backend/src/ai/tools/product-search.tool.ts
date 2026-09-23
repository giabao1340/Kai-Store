import { Type } from '@google/genai';

export const productSearchTool = {
  name: 'search_products',

  description: `
  Tìm kiếm sản phẩm trong Kai Store theo tên, thương hiệu,
  danh mục và khoảng giá.

  Nếu đã có brandId từ search_brands thì PHẢI sử dụng brandId đó
  để lọc sản phẩm của thương hiệu tương ứng.

  Không cần gọi lại search_products bằng search nếu đã có brandId
  phù hợp với yêu cầu thương hiệu.
  `,

  parameters: {
    type: Type.OBJECT,

    properties: {
      search: {
        type: Type.STRING,
        description:
          'Tên hoặc từ khóa sản phẩm. Ví dụ: Nike Air Force, Adidas, giày chạy bộ.',
      },

      brandId: {
        type: Type.STRING,
        description:
          'ID thương hiệu nếu khách hàng chỉ định thương hiệu. Nếu không biết ID thì để trống.',
      },

      categoryId: {
        type: Type.STRING,
        description:
          'ID danh mục nếu khách hàng chỉ định danh mục. Nếu không biết ID thì để trống.',
      },

      minPrice: {
        type: Type.NUMBER,
        description:
          'Giá tối thiểu tính bằng VND. Chỉ truyền khi khách hàng yêu cầu.',
      },

      maxPrice: {
        type: Type.NUMBER,
        description:
          'Giá tối đa tính bằng VND. Chỉ truyền khi khách hàng yêu cầu.',
      },
    },

    required: [],
  },
};
