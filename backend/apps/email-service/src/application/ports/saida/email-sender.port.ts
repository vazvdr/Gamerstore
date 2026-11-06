export interface EmailSenderPort {
  enviarEmail(payload: EmailSenderPayload): Promise<string | undefined>;
}

export interface EmailSenderPayload {
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  htmlContent: string;
}

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');