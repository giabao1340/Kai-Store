import { Type } from '@google/genai';

export const brandSearchTool = {
  name: 'search_brands',

  description:
    'Tìm kiếm thương hiệu trong Kai Store theo tên. Sử dụng tool này khi khách hàng đề cập đến một thương hiệu nhưng AI chưa biết brandId.',

  parameters: {
    type: Type.OBJECT,

    properties: {
      search: {
        type: Type.STRING,
        description: 'Tên thương hiệu cần tìm. Ví dụ: Nike, Adidas, Puma.',
      },
    },

    required: ['search'],
  },
};
