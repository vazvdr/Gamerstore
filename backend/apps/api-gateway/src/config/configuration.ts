export default () => ({
  port: Number(process.env.PORT ?? 3001),
  security: {
    internalApiKey: process.env.INTERNAL_API_KEY,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  },
  services: {
    produtosUrl: process.env.PRODUTOS_SERVICE_URL,
    usuarioUrl: process.env.USUARIO_SERVICE_URL,
    carrinhoUrl: process.env.CARRINHO_SERVICE_URL,
  },
});

export function validateConfiguration(config: Record<string, unknown>) {
  const requiredVariables = [
    'INTERNAL_API_KEY',
    'JWT_ACCESS_SECRET',
    'PRODUTOS_SERVICE_URL',
    'USUARIO_SERVICE_URL',
    'CARRINHO_SERVICE_URL',
  ];
  const missingVariables = requiredVariables.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || !value.trim();
  });
  if (missingVariables.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${missingVariables.join(', ')}`,
    );
  }
  const port = Number(config.PORT ?? 3001);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }
  const serviceUrls = [
    'PRODUTOS_SERVICE_URL',
    'USUARIO_SERVICE_URL',
    'CARRINHO_SERVICE_URL',
  ];
  for (const key of serviceUrls) {
    try {
      const url = new URL(config[key] as string);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      throw new Error(`${key} deve ser uma URL HTTP ou HTTPS válida.`);
    }
  }
  return config;
}