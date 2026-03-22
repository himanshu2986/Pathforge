export interface EmailContent {
  title: string;
  greeting: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

export const getBrandedEmail = ({ title, greeting, body, buttonText, buttonUrl, footerText }: EmailContent) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          .email-wrapper { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b1a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 40px 20px; text-align: center; }
          .logo { font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.025em; margin: 0; }
          .content { padding: 40px 30px; line-height: 1.6; color: #cbd5e1; }
          .title { color: white; font-size: 24px; font-weight: 700; margin-bottom: 24px; }
          .greeting { color: #f8fafc; font-size: 18px; font-weight: 600; margin-bottom: 16px; }
          .button-wrapper { text-align: center; margin: 40px 0; }
          .button { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3); }
          .footer { padding: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e1e38; }
          .social-links { margin-bottom: 16px; }
          .accent { color: #06b6d4; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1 class="logo">PATHFORGE<span style="color:rgba(255,255,255,0.6)">ATLAS</span></h1>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            <div class="greeting">Hello ${greeting},</div>
            <p>${body}</p>
            ${buttonText && buttonUrl ? `
              <div class="button-wrapper">
                <a href="${buttonUrl}" class="button">${buttonText}</a>
              </div>
            ` : ''}
            <p style="margin-top: 32px;">If you have any questions, our support team is available 24/7 to help you along your journey.</p>
            <p>Onwards,<br><span class="accent">The Pathforge Atlas Team</span></p>
          </div>
          <div class="footer">
            <p>${footerText || ''}</p>
            <p>&copy; 2026 Pathforge Atlas. All rights reserved.</p>
            <p>123 Career Blvd, Future Tech Valley, CA 94043</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
