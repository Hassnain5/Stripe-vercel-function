const functions = require("firebase-functions");
const Stripe = require("stripe");

// ⚠️ Replace this with your actual secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  // ✅ Allow Flutter app (CORS)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // ✅ 1️⃣ Get amount & currency from request body
    const { amount, currency } = req.body;

    // Basic validation
    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    // ✅ 2️⃣ Create PaymentIntent with dynamic amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // In cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // ✅ 3️⃣ Return client secret
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});
