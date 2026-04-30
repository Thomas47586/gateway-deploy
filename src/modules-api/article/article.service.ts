import { Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { buildQueryPrisma } from 'src/common/helpers/build-query-prisma.helper';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(
    private prisma: PrismaService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  create(createArticleDto: CreateArticleDto) {
    return 'This action adds a new article';
  }

  async findAll(request) {
    // QUERY:
    // Thường dùng phân trang, lọc, tìm kiếm

    // sequelize
    // const resultSequelize = await Article.findAll();

    // CACHE: Kiểm tra trong ram có thì trả về luôn
    // const value = await this.cacheManager.get('key');
    // if (value) {
    //   return value;
    // }

    const { page, pageSize, index, where } = buildQueryPrisma(request);

    const resultPrismaPromise = this.prisma.articles.findMany({
      where: where,
      skip: index, // Skip tương đương OFFSET
      take: pageSize, // Take tương đương với LIMIT
    });

    const totalItemsPromise = this.prisma.articles.count({
      where: where,
    });

    // Chạy đồng thời
    const [resultPrisma, totalItems] = await Promise.all([
      resultPrismaPromise,
      totalItemsPromise,
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const result = {
      totalItems: totalItems,
      totalPages: totalPages,
      page: page,
      pageSize: pageSize,
      items: resultPrisma,
    };

    // await this.cacheManager.set('article', result);
    // console.dir(this.cacheManager.stores, { color: true, depth: null });

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
