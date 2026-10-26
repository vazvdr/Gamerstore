import { Module } from '@nestjs/common';
import { ProdutosServiceController } from './produtos-service.controller.js';
import { ProdutosServiceService } from './produtos-service.service.js';

@Module({
  imports: [],
  controllers: [ProdutosServiceController],
  providers: [ProdutosServiceService],
})
export class ProdutosServiceModule {}
