import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';

@Injectable()
export class SearchAppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}
  async onModuleInit() {
    this.initArticle();
    this.initUser();
    this.initFood();
  }
  async searchApp(text: string) {
    console.log({ text });

    const resutl = await this.elasticsearchService.search({
      index: ['articles', 'users', 'foods'],
      query: {
        multi_match: {
          query: text,
          fields: [
            'title',
            'content',
            'email',
            'fullName',
            'name',
            'description',
          ],
          operator: 'OR', // Chỉ cần khớp 1 phần từ khoá => Tìm kiếm mềm
          fuzziness: 'AUTO', // Hỗ trợ tìm kiếm bị thiếu ký tự
          minimum_should_match: '60%', // Yêu cầu khớp bao nhiêu % số từ trong câu search của user
        },
      },
    });

    return resutl;
  }

  async initArticle() {
    // Xóa bảng trên elastic để lấy dữ liệu mới đồng bộ
    // this.elasticsearchService.indices.delete({
    //   index: 'articles',
    //   ignore_unavailable: true,
    // });

    const articles = await this.prisma.articles.findMany();
    articles.forEach((article) => {
      // Index là nạp bảng từ DB vào elastic
      // document là một row trong bảng
      this.elasticsearchService.index({
        index: 'articles',
        id: String(article.id),
        document: article,
      });
    });
  }

  async initUser() {
    // Xóa bảng trên elastic để lấy dữ liệu mới đồng bộ
    // this.elasticsearchService.indices.delete({
    //   index: 'users',
    //   ignore_unavailable: true,
    // });

    const users = await this.prisma.users.findMany();
    users.forEach((user) => {
      // Index là nạp bảng từ DB vào elastic
      // document là một row trong bảng
      this.elasticsearchService.index({
        index: 'users',
        id: String(user.id),
        document: user,
      });
    });
  }

  async initFood() {
    // Xóa bảng trên elastic để lấy dữ liệu mới đồng bộ
    // this.elasticsearchService.indices.delete({
    //   index: 'food',
    //   ignore_unavailable: true,
    // });

    const foods = await this.prisma.foods.findMany();
    foods.forEach((food) => {
      // Index là nạp bảng từ DB vào elastic
      // document là một row trong bảng
      this.elasticsearchService.index({
        index: 'foods',
        id: String(food.id),
        document: food,
      });
    });
  }
}
