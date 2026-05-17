// server/utils/emailService.js
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ── Shared HTML wrapper ───────────────────────────────────────────
const wrap = (body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { margin:0; padding:0; background:#fdf8f3; font-family:'DM Sans',Helvetica,Arial,sans-serif; color:#1a1a1a; }
    .container { max-width:560px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .header { background:#f97316; padding:32px 40px; }
    .header h1 { margin:0; font-size:24px; color:#fff; font-family:Georgia,serif; letter-spacing:-.5px; }
    .body { padding:36px 40px; }
    .body p { margin:0 0 16px; font-size:15px; line-height:1.6; color:#444; }
    .btn { display:inline-block; margin:24px 0; padding:14px 32px; background:#f97316; color:#fff !important; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600; }
    .footer { padding:20px 40px; background:#fdf8f3; font-size:12px; color:#999; }
    .link-fallback { word-break:break-all; color:#f97316; font-size:13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📚 BookHaven</h1></div>
    <div class="body">${body}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} BookHaven. All rights reserved.<br/>
      If you didn't create an account, you can safely ignore this email.
    </div>
  </div>
</body>
</html>`;

// ── sendVerificationEmail ─────────────────────────────────────────
exports.sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sgMail.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your BookHaven email address",
    html: wrap(`
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thanks for joining BookHaven! To complete your registration and start exploring our collection, please verify your email address.</p>
      <a href="${verifyUrl}" class="btn">Verify My Email</a>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p class="link-fallback">${verifyUrl}</p>
    `),
  });
};

// ── sendPasswordResetEmail ────────────────────────────────────────
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sgMail.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your BookHaven password",
    html: wrap(`
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p class="link-fallback">${resetUrl}</p>
    `),
  });
};

// ── sendOrderConfirmation ─────────────────────────────────────────
exports.sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e0">${i.book?.title ?? "Book"}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;text-align:center">${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  await sgMail.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: wrap(`
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed. 🎉</p>
      <table width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;font-size:14px">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #f97316;color:#f97316">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #f97316;color:#f97316">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #f97316;color:#f97316">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top:12px;font-weight:700">Total</td>
            <td style="padding-top:12px;font-weight:700;text-align:right">$${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">View Order</a>
    `),
  });
};

// ── sendShippingNotification ──────────────────────────────────────
exports.sendShippingNotification = async (user, order) => {
  await sgMail.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Your BookHaven order ${order.orderNumber} has shipped!`,
    html: wrap(`
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your order <strong>${order.orderNumber}</strong> is on its way. 📦</p>
      ${order.trackingNumber ? `<p>Tracking number: <strong>${order.trackingNumber}</strong></p>` : ""}
      <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">Track Order</a>
    `),
  });
};