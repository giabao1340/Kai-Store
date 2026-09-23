import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import { ProductService } from '../product/product.service';
import { productSearchTool } from './tools/product-search.tool';
import { brandSearchTool } from './tools/brand-search.tool';
import { BrandService } from '../brand/brand.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private readonly ai: GoogleGenAI;

  private readonly model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  constructor(
    private readonly productService: ProductService,
    private readonly brandService: BrandService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY chưa được cấu hình');
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });

    this.logger.log(`Gemini model: ${this.model}`);
  }

  async chat(message: string) {
    const contents: any[] = [
      {
        role: 'user',
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    const config = {
      systemInstruction: `
        Bạn là AI Shopping Assistant của Kai Store.

        Nhiệm vụ:
        - Hỗ trợ khách hàng tìm kiếm và tư vấn sản phẩm.
        - Chỉ sử dụng dữ liệu thực tế từ các tool của Kai Store.
        - Không được tự bịa sản phẩm, thương hiệu, giá hoặc tồn kho.

        QUY TẮC TÌM KIẾM:

        1. Khi người dùng muốn tìm sản phẩm, hãy sử dụng search_products.

        2. Nếu người dùng đề cập đến một thương hiệu
          nhưng chưa biết brandId,
          BẮT BUỘC gọi search_brands trước.

        3. Sau khi search_brands trả về brandId,
          sử dụng brandId đó khi gọi search_products.

        4. Khi search_products đã trả về sản phẩm phù hợp,
          KHÔNG được gọi lại search_products với query khác
          chỉ để kiểm tra lại.

        5. Nếu yêu cầu có nhiều điều kiện,
          hãy kết hợp chúng trong MỘT lần gọi search_products.

          Ví dụ:
          "Nike dưới 3 triệu"

          search_brands("Nike")
          →
          search_products({
              brandId: "...",
              maxPrice: 3000000
          })

        6. Nếu search_products trả về total > 0,
          hãy sử dụng chính kết quả đó để trả lời khách hàng.

        7. Nếu search_products trả về total = 0,
          mới nói rằng không tìm thấy sản phẩm phù hợp.

        8. Không được bỏ brandId khi người dùng đã yêu cầu
          một thương hiệu cụ thể.

        9. Không được tự đoán brandId.

        10. Không được sử dụng kết quả của một lần search khác
            để thay thế cho kết quả tìm kiếm hiện tại.

        11. Trả lời bằng tiếng Việt.

        12. Không giải thích kỹ thuật về tool cho khách hàng.
        `,

      tools: [
        {
          functionDeclarations: [productSearchTool, brandSearchTool],
        },
      ],
    };

    try {
      // ==========================================
      // STEP 1: Gửi câu hỏi tới Gemini
      // ==========================================

      let response = await this.ai.models.generateContent({
        model: this.model,
        contents,
        config,
      });

      // ==========================================
      // STEP 2: Kiểm tra Gemini có gọi tool không
      // ==========================================
      let iteration = 0;
      const MAX_ITERATIONS = 5;

      while (response.functionCalls && response.functionCalls.length > 0) {
        iteration++;
        const functionResponses: any[] = [];

        for (const functionCall of response.functionCalls) {
          this.logger.debug(`Tool call: ${functionCall.name}`);

          this.logger.debug(`Arguments: ${JSON.stringify(functionCall.args)}`);

          let result: unknown;

          try {
            // ==========================================
            // STEP 3: Execute tool
            // ==========================================

            switch (functionCall.name) {
              case 'search_products':
                result = await this.executeProductSearch(
                  functionCall.args ?? {},
                );
              case 'search_brands':
                result = await this.executeBrandSearch(functionCall.args ?? {});
                break;
              default:
                result = {
                  error: `Tool "${functionCall.name}" không tồn tại`,
                };
            }
          } catch (error) {
            this.logger.error(`Tool ${functionCall.name} failed`, error);

            result = {
              error:
                error instanceof Error
                  ? error.message
                  : 'Không thể thực hiện tool',
            };
          }

          // ==========================================
          // STEP 4:
          // Trả kết quả tool về Gemini
          // ==========================================

          functionResponses.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: functionCall.name,
                  id: functionCall.id,
                  response: {
                    result,
                  },
                },
              },
            ],
          });
        }

        // ==========================================
        // STEP 5:
        // Thêm response của Gemini vào history
        // ==========================================

        if (response.candidates?.[0]?.content) {
          contents.push(response.candidates[0].content);
        }

        // ==========================================
        // STEP 6:
        // Thêm kết quả tool vào history
        // ==========================================

        contents.push(...functionResponses);

        // ==========================================
        // STEP 7:
        // Gọi Gemini lần nữa
        // ==========================================

        response = await this.ai.models.generateContent({
          model: this.model,
          contents,
          config,
        });
      }

      // ==========================================
      // STEP 8:
      // Gemini trả câu trả lời cuối
      // ==========================================

      return {
        message: response.text || 'Xin lỗi, tôi không thể trả lời lúc này.',
      };
    } catch (error) {
      this.logger.error('Gemini API error', error);

      throw error;
    }
  }

  // ==========================================
  // SEARCH PRODUCTS TOOL
  // ==========================================

  private async executeProductSearch(args: {
    search?: string;
    brandId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const result = await this.productService.findAll({
      search: args.search || undefined,

      brandId: args.brandId || undefined,

      categoryId: args.categoryId || undefined,

      minPrice: args.minPrice !== undefined ? String(args.minPrice) : undefined,

      maxPrice: args.maxPrice !== undefined ? String(args.maxPrice) : undefined,

      page: '1',

      limit: '10',
    });

    // Không gửi toàn bộ Prisma object cho Gemini.
    // Chỉ gửi dữ liệu cần thiết cho AI.

    return {
      total: result.total,

      products: result.items.map((product) => ({
        id: product.id,

        name: product.name,

        slug: product.slug,

        brand: product.brand?.name ?? null,

        category: product.category?.name ?? null,

        variants: product.variants.map((variant) => ({
          id: variant.id,

          size: variant.size,

          color: variant.color,

          price: Number(variant.price),

          stock: variant.stock,

          imageUrl: variant.imageUrl,
        })),
      })),
    };
  }
  private async executeBrandSearch(args: { search?: string }) {
    const brands = await this.brandService.findAll(args.search);

    return {
      total: brands.length,

      brands: brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
      })),
    };
  }
}
