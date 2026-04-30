import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Users } from 'src/modules-system/prisma/generated/prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE } from 'src/common/constant/rabbit-mq.constant';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  // Lấy ra sender
  constructor(@Inject(ORDER_SERVICE) private client: ClientProxy) {}

  async create(createOrderDto: CreateOrderDto, user: Users) {
    const data = { userId: user.id, foodId: createOrderDto.foodId };

    console.log({ user, createOrderDto, data });

    // SEND: quan trọng kết quả trả về, phải đợi kết quả trả về => Dùng với await LastValueFrom
    // Sử dụng last value from để làm cơ chế chờ kết quả
    const result = await lastValueFrom(
      // Gửi data từ Sender đi
      this.client.send('createOrder', data),
    );

    // SEND luôn đi chung với decorartor @MessagePattern để nhận tín hiệu khi sử dụng send

    return result;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
