const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Book = require('../models/Book');
const { Cart } = require('../models/CartWishlist');

// POST /api/checkout/create-session
const createCheckoutSession = async (req, res, next) => {
  try {
    const { items, shippingAddress, guestEmail } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'No items provided.' });

    // Build Stripe line items + validate stock
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const book = await Book.findById(item.bookId || item.book);
      if (!book) return res.status(404).json({ error: `Book not found.` });
      if (book.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for "${book.title}".` });
      }

      subtotal += book.price * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: book.title,
            description: `by ${book.author}`,
            images: [book.coverImage],
            metadata: { bookId: book._id.toString() },
          },
          unit_amount: Math.round(book.price * 100), // cents
        },
        quantity: item.quantity,
      });
    }

    const shippingCost = subtotal >= 35 ? 0 : 499; // cents
    const customerEmail = req.user.isGuest ? guestEmail : req.user.email;

    // Create a pending order first so we can link it via metadata
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const book = await Book.findById(item.bookId || item.book);
        return {
          book: book._id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          price: book.price,
          quantity: item.quantity,
        };
      })
    );

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shippingCostDollars = shippingCost / 100;
    const total = parseFloat((subtotal + shippingCostDollars + tax).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      guestEmail: req.user.isGuest ? guestEmail : null,
      items: enrichedItems,
      shippingAddress: shippingAddress || {
        name: req.user.name,
        line1: 'TBD',
        city: 'TBD',
        postalCode: '00000',
        country: 'US',
      },
      subtotal,
      shippingCost: shippingCostDollars,
      tax,
      total,
      status: 'pending',
      paymentMethod: 'stripe',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCost, currency: 'usd' },
            display_name: subtotal >= 35 ? 'Free shipping' : 'Standard shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    // Save Stripe session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

// POST /api/checkout/webhook — called by Stripe
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const order = await Order.findOne({ stripeSessionId: session.id });
      if (!order) {
        console.error('Order not found for session:', session.id);
        return res.sendStatus(200);
      }

      // Update order status
      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = session.payment_intent;

      // Update shipping address from Stripe if available
      if (session.shipping_details?.address) {
        const addr = session.shipping_details.address;
        order.shippingAddress = {
          name: session.shipping_details.name,
          line1: addr.line1,
          line2: addr.line2 || '',
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
        };
      }

      await order.save();

      // Decrement stock and increment sold count
      for (const item of order.items) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        });
      }

      // Clear the user's cart
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

      console.log(`✅ Order ${order._id} paid and fulfilled.`);
    } catch (err) {
      console.error('Error fulfilling order:', err);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: pi.id },
      { paymentStatus: 'failed', status: 'cancelled' }
    );
  }

  res.sendStatus(200);
};

// GET /api/checkout/session/:sessionId — verify payment after redirect
const getSession = async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const order = await Order.findOne({ stripeSessionId: req.params.sessionId });

    res.json({ session, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCheckoutSession, handleWebhook, getSession };
