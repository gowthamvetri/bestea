// Email template for order confirmation
const orderConfirmationEmail = (order, user) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.name || 'Product'}
          ${item.variant ? `<span style="color: #666; font-size: 12px;"> (${item.variant})</span>` : ''}
        </div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">BESTEA</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-top: 0;">Dear ${user.name || 'Customer'},</p>
        
        <p>Thank you for your order! We're excited to deliver fresh tea to your doorstep.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h2 style="margin-top: 0; color: #10b981;">Order Details</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.status.toUpperCase()}</span></p>
        </div>
        
        <h3 style="color: #374151;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
              <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">₹${order.subtotal}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
              <td style="padding: 10px; text-align: right;">₹${order.shippingCharges || 0}</td>
            </tr>
            ${order.discount?.amount ? `
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; color: #059669;">Discount:</td>
              <td style="padding: 10px; text-align: right; color: #059669;">-₹${order.discount.amount}</td>
            </tr>
            ` : ''}
            <tr style="background: #f3f4f6; font-size: 18px;">
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #10b981;">₹${order.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Shipping Address</h3>
          <p style="margin: 5px 0;">${order.shippingAddress.name}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.addressLine1}</p>
          ${order.shippingAddress.addressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddress.addressLine2}</p>` : ''}
          <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>⏰ Cancellation Policy:</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400e;">You can cancel this order within 24 hours of placing it. After 24 hours, cancellation may not be possible if the order has been processed.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p>Track your order or manage it from your account dashboard.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
            View Order Details
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Thank you for choosing BESTEA!</p>
          <p>For any queries, contact us at <a href="mailto:support@bestea.com" style="color: #10b981;">support@bestea.com</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} BESTEA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order status update
const orderStatusUpdateEmail = (order, user, previousStatus) => {
  const statusMessages = {
    pending: {
      title: 'Order Received',
      message: 'We have received your order and it is being processed.',
      color: '#3b82f6'
    },
    confirmed: {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and will be prepared for shipping soon.',
      color: '#10b981'
    },
    processing: {
      title: 'Order Processing',
      message: 'Your order is being prepared for shipment.',
      color: '#f59e0b'
    },
    shipped: {
      title: 'Order Shipped',
      message: 'Great news! Your order is on its way to you.',
      color: '#8b5cf6'
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been delivered. We hope you enjoy your tea!',
      color: '#10b981'
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled as requested.',
      color: '#ef4444'
    }
  };

  const statusInfo = statusMessages[order.status] || statusMessages.pending;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">BESTEA</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">${statusInfo.title}</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-top: 0;">Dear ${user.name || 'Customer'},</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid ${statusInfo.color};">
          <div style="font-size: 48px; margin-bottom: 15px;">
            ${order.status === 'delivered' ? '✅' : order.status === 'cancelled' ? '❌' : order.status === 'shipped' ? '🚚' : '📦'}
          </div>
          <h2 style="margin: 0; color: ${statusInfo.color};">${statusInfo.title}</h2>
          <p style="font-size: 16px; margin: 15px 0 0 0;">${statusInfo.message}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Order Information</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
          <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${order.status.toUpperCase()}</span></p>
          ${order.shipping?.trackingNumber ? `
            <p><strong>Tracking Number:</strong> <span style="color: #10b981; font-weight: bold;">${order.shipping.trackingNumber}</span></p>
          ` : ''}
        </div>

        ${order.status === 'pending' || order.status === 'confirmed' ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>⏰ You can still cancel this order</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400e;">Cancellation is available within 24 hours of placing the order.</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
             style="display: inline-block; background: ${statusInfo.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Thank you for choosing BESTEA!</p>
          <p>For any queries, contact us at <a href="mailto:support@bestea.com" style="color: #10b981;">support@bestea.com</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} BESTEA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order cancellation confirmation
const orderCancellationEmail = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">BESTEA</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Cancelled</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-top: 0;">Dear ${user.name || 'Customer'},</p>
        
        <p>Your order has been successfully cancelled as requested.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #374151;">Cancelled Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
          <p><strong>Order Amount:</strong> ₹${order.total}</p>
        </div>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af;"><strong>💳 Refund Information:</strong></p>
          <p style="margin: 5px 0 0 0; color: #1e40af;">
            ${order.payment?.method === 'online' || order.payment?.method === 'card' 
              ? 'Your refund will be processed within 5-7 business days to your original payment method.' 
              : 'No payment was collected for this order.'}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p>We're sorry to see you cancel this order. We hope to serve you again soon!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
            Continue Shopping
          </a>
        </div>
        
        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Thank you for choosing BESTEA!</p>
          <p>For any queries, contact us at <a href="mailto:support@bestea.com" style="color: #10b981;">support@bestea.com</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} BESTEA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  orderCancellationEmail
};
