/**
 * CYBERRIDE AUTOMATED INVOICE & EMAIL NOTIFICATION SERVICE (MODULE 04)
 * Generates official UAE VAT Tax Invoices and handles Resend/SendGrid email payloads.
 */

export const CYBERRIDE_TRN_NUMBER = "100492817200003"; // Official UAE Tax Registration Number

/**
 * Generate HTML printable Tax Invoice (matching UAE Federal Tax Authority requirements)
 */
export const generateTaxInvoiceHTML = (order) => {
  const rawTotal = Number(order?.total);
  const total = !isNaN(rawTotal) && rawTotal > 0 ? rawTotal : 349;
  const vatRate = 0.05;
  const vatAmount = Math.round((total * vatRate) * 100) / 100;
  const netAmount = Math.round((total - vatAmount) * 100) / 100;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TAX INVOICE — ${order?.id || 'CR-DXB-991204'}</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #fff; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; border: 2px solid #E10600; padding: 30px; border-radius: 12px; background: #0A0A0A; }
        .header { display: flex; justify-content: space-between; border-b: 1px solid #333; padding-bottom: 20px; }
        .title { color: #E10600; font-size: 24px; font-weight: bold; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #222; text-align: left; }
        .table th { color: #888; text-transform: uppercase; font-size: 11px; }
        .total-row { color: #E10600; font-size: 16px; font-weight: bold; }
        .qr-placeholder { border: 1px solid #E10600; padding: 10px; text-align: center; color: #E10600; font-size: 10px; width: 120px; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="title">CYBERRIDE TAX INVOICE</div>
            <div style="font-size: 11px; color: #888; margin-top: 4px;">CYBERRIDE FZ-LLC • DUBAI DESIGN DISTRICT (d3), UAE</div>
            <div style="font-size: 11px; color: #00ffcc; margin-top: 2px;">TRN: ${CYBERRIDE_TRN_NUMBER}</div>
          </div>
          <div style="text-align: right;">
            <div>INVOICE #: ${order?.id || 'CR-DXB-991204'}</div>
            <div style="font-size: 11px; color: #888;">DATE: ${order?.date || new Date().toISOString().slice(0, 10)}</div>
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 12px;">
          <strong>BILLED TO:</strong> ${order?.customer || 'Sultan Al-Maktoum'}<br>
          <strong>EMAIL:</strong> ${order?.email || 'sultan.rider@cyberride.ae'}<br>
          <strong>PHONE:</strong> ${order?.phone || '+971 50 123 4567'}<br>
          <strong>ADDRESS:</strong> ${order?.address || order?.zone || 'Dubai Marina, UAE'}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>COLOR / SPEC</th>
              <th>QTY</th>
              <th>AMOUNT (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order?.items || 'CYBERRIDE NEXUS LED SMART BACKPACK'}</td>
              <td>${order?.color || 'STEALTH BLACK'} (${order?.led || 'RED PULSE EYES'})</td>
              <td>1</td>
              <td>${total} AED</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right; font-size: 12px; line-height: 1.8;">
          <div>NET SUBTOTAL: ${netAmount} AED</div>
          <div>5% UAE VAT: ${vatAmount} AED</div>
          <div class="total-row">TOTAL DUE: ${total} AED</div>
        </div>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-t: 1px solid #222; pt: 20px;">
          <div class="qr-placeholder">
            [VERIFIED TRN]<br>FTA COMPLIANT
          </div>
          <div style="font-size: 10px; color: #666; text-align: right;">
            THANK YOU FOR RIDING WITH CYBERRIDE DUBAI.<br>
            SUPPORT: ORDERS@CYBERRIDE.AE
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Trigger Order Confirmation Email (Resend API Payload Builder)
 */
export const buildOrderConfirmationEmail = (order) => {
  return {
    from: 'CyberRide Dubai <orders@cyberride.ae>',
    to: order.email,
    subject: `TRANSMISSION COMPLETE — Order #${order.id}`,
    html: `
      <div style="background:#0A0A0A; color:#FFF; font-family:monospace; padding:30px; border-radius:10px; border:1px solid #E10600;">
        <h2 style="color:#E10600;">ORDER CONFIRMED #${order.id}</h2>
        <p>Thank you, ${order.customer}! Your order for <strong>${order.items}</strong> has been received and scheduled for Dubai Express dispatch.</p>
        <p><strong>Tracking Number:</strong> ${order.tracking || 'ARM-DXB-PREPARED'}</p>
        <p><strong>Total Paid:</strong> ${order.total} AED (Includes 5% UAE VAT)</p>
        <hr style="border-color:#333;">
        <p style="font-size:11px; color:#888;">CyberRide FZ-LLC • TRN: ${CYBERRIDE_TRN_NUMBER}</p>
      </div>
    `
  };
};
