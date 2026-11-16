
export default () => ({
  port: Number(process.env.PORT ?? 3003),

  database: {
    url: process.env.USER_DATABASE_URL,
  },

  security: {
    internalApiKey: process.env.INTERNAL_API_KEY,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    recuperarSenhaQueue:
      process.env.RABBITMQ_RECUPERAR_SENHA_QUEUE ??
      'usuario-recuperar-senha',
  },

  frontend: {
    url: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },

  passwordReset: {
    ttl: Number(process.env.PASSWORD_RESET_TTL ?? 300),
  },
});

export function validateConfiguration(config: Record<string, unknown>) {
  const requiredVariables = [
    'USER_DATABASE_URL',
    'INTERNAL_API_KEY',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingVariables = requiredVariables.filter(
    (key) => {
      const value = config[key];
      return typeof value !== 'string' || !value.trim();
    },
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${missingVariables.join(', ')}`,
    );
  }

  const port = Number(config.PORT ?? 3003);
  const passwordResetTtl = Number(config.PASSWORD_RESET_TTL ?? 300);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }

  if (!Number.isInteger(passwordResetTtl) || passwordResetTtl <= 0) {
    throw new Error('PASSWORD_RESET_TTL deve ser um número inteiro positivo.');
  }

  return config;
}
