export default () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    recuperarSenhaQueue:
      process.env.RABBITMQ_RECUPERAR_SENHA_QUEUE ??
      'usuario-recuperar-senha',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    senderName: process.env.BREVO_SENDER_NAME ?? 'GamerStore',
  },
});
export function validateConfiguration(config: Record<string, unknown>) {
  const requiredVariables = [
    'RABBITMQ_URL',
    'BREVO_API_KEY',
    'BREVO_SENDER_EMAIL',
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
  return config;
}
