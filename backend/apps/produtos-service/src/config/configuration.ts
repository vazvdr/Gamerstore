export default () => ({
  port: Number(process.env.PORT ?? 3002),
  database: {
    url: process.env.PRODUTOS_DATABASE_URL,
  },
  security: {
    internalApiKey: process.env.INTERNAL_API_KEY,
  },
});
export function validateConfiguration(config: Record<string, unknown>) {
  const requiredVariables = [
    'PRODUTOS_DATABASE_URL',
    'INTERNAL_API_KEY',
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
  const port = Number(config.PORT ?? 3002);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }
  return config;
}
