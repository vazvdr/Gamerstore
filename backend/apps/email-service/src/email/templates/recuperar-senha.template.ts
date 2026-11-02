
interface RecuperarSenhaTemplateProps {
  nome: string;
  link: string;
}

export function recuperarSenhaTemplate({ nome, link }: RecuperarSenhaTemplateProps): string {
  const nomeSeguro = nome.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!);

  const linkSeguro = link.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Recuperação de senha | GamerStore</title>
      </head>

      <body style="margin:0; padding:0; background-color:#080A08; font-family:Arial, Helvetica, sans-serif; color:#FFFFFF;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#080A08; padding:40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding:0 20px 32px;">
                    <h1 style="margin:0; color:#B6FF00; font-size:30px; font-weight:900; letter-spacing:2px;">
                      GAMERSTORE
                    </h1>
                    <p style="margin:8px 0 0; color:#A3A3A3; font-size:11px; letter-spacing:3px;">
                      PERFORMANCE • TECNOLOGIA • GAMING
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:36px 32px; background-color:#191D19; border:1px solid #303830; border-radius:12px;">

                    <h2 style="margin:0 0 24px; color:#FFFFFF; font-size:25px; font-weight:700;">
                      Redefinição de senha
                    </h2>

                    <p style="margin:0 0 16px; color:#D1D5D1; font-size:15px; line-height:1.7;">
                      Olá, <strong style="color:#FFFFFF;">${nomeSeguro}</strong>!
                    </p>

                    <p style="margin:0 0 28px; color:#D1D5D1; font-size:15px; line-height:1.7;">
                      Recebemos uma solicitação para redefinir a senha da sua conta GamerStore.
                    </p>

                    <!-- Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 28px;">
                      <tr>
                        <td align="center" bgcolor="#B6FF00" style="border-radius:6px;">
                          <a
                            href="${linkSeguro}"
                            target="_blank"
                            style="display:inline-block; padding:16px 32px; color:#080A08; font-size:14px; font-weight:900; letter-spacing:0.5px; text-decoration:none;"
                          >
                            REDEFINIR MINHA SENHA
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px; color:#A3A3A3; font-size:13px; line-height:1.7;">
                      Se você não solicitou essa alteração, ignore este e-mail. Sua senha permanecerá inalterada.
                    </p>

                    <div style="height:1px; background-color:#303830; margin:24px 0;"></div>

                    <p style="margin:0; color:#777D77; font-size:12px; line-height:1.7;">
                      Por segurança, este link terá validade limitada e poderá ser utilizado uma única vez.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding:30px 20px 0;">
                    <p style="margin:0 0 8px; color:#B6FF00; font-size:17px; font-weight:900; letter-spacing:2px;">
                      GAMERSTORE
                    </p>
                    <p style="margin:0; color:#777D77; font-size:11px;">
                      © GamerStore — Todos os direitos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
