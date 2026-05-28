import Razorpay from 'razorpay';

export const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      })
    : null;

export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  if (!razorpay) {
    return {
      id: `mock_order_${Date.now()}`,
      amount: amountInRupees * 100,
      currency: 'INR',
      receipt
    };
  }

  return razorpay.orders.create({
    amount: amountInRupees * 100,
    currency: 'INR',
    receipt,
    payment_capture: true
  });
}