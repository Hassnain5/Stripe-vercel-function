import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Load STRIPE_SECRET_KEY from Railway env

const app = express();
app.use(express.json());

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Stripe payment API is running!");
});

// ✅ Payment Intent endpoint
app.post("/create-payment-intent", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Railway sets the PORT automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
