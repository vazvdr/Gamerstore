import { Module } from '@nestjs/common';
import { BrevoEmailAdapter } from '../adapters/saida/notifications/email/brevo-email.adapter.js';
import { EMAIL_SENDER } from '../application/ports/saida/email-sender.port.js';

@Module({
    providers: [
        BrevoEmailAdapter,
        { provide: EMAIL_SENDER, useExisting: BrevoEmailAdapter },
    ],
    exports: [EMAIL_SENDER],
})
export class EmailAdaptersModule { }
