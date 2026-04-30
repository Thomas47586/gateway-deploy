import { Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import {
  ClientProvider,
  ClientProxy,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { connect } from 'http2';
import { RABBIT_MQ_URL } from 'src/common/constant/app.constant';
import { ORDER_SERVICE } from 'src/common/constant/rabbit-mq.constant';

@Global()
@Module({
  imports: [
    // Tạo ra sender microservice gửi tín hiệu tới trung gian Rabbit-mq
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          // Thêm user:password@ vào urls
          urls: [RABBIT_MQ_URL!],
          queue: 'order_queue',
          queueOptions: {
            durable: false, // Nếu server order down thì queue vẫn được giữ lại
          },
          // Thiết lập tên kết nối
          socketOptions: {
            connectionOptions: {
              clientProperties: {
                connection_name: 'order_send',
              },
            },
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMqModule implements OnModuleInit {
  constructor(@Inject(ORDER_SERVICE) private client: ClientProxy) {}
  async onModuleInit() {
    try {
      const result = await this.client.connect();
      console.log('[RABBIT-MQ] Kết nối thành công');
    } catch (error) {
      console.log({ RabbitMqModule: error });
    }
  }
}
