import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    createClient,
    RedisClientType,
} from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: RedisClientType;
    constructor(private readonly config: ConfigService) { }
    async onModuleInit(): Promise<void> {
        this.client = createClient({
            url: this.config.getOrThrow<string>('redis.url'),
        });
        this.client.on('error', (error) => {
            console.error('Redis error:', error);
        });
        await this.client.connect();
    }
    async onModuleDestroy(): Promise<void> {
        if (this.client?.isOpen) {
            await this.client.quit();
        }
    }
    async buscar(chave: string): Promise<string | null> {
        return this.client.get(chave);
    }
    async salvar(
        chave: string,
        valor: string,
        ttl: number,
    ): Promise<void> {
        await this.client.set(chave, valor, {
            EX: ttl,
        });
    }
    async remover(chave: string): Promise<void> {
        await this.client.del(chave);
    }
}
