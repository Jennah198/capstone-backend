import axios from "axios";
import { Chapa } from "chapa-nodejs";
import dotenv from "dotenv";
import { Payment, Order, Ticket, Event } from "../model/schema.js";

dotenv.config();
const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY,
});

// export const pay = async (req, res) => {
//   const { first_name, last_name, email, phone_number, amount } = req.body;

//   try {
//     // Simple demo tx_ref
//     const tx_ref = `TX-${Date.now()}`;
//     console.log(tx_ref);

//     // ✅ Call initialize on the instance
//     const response = await chapa.initialize({
//       first_name,
//       last_name,
//       email,
//       phone_number,
//       currency: "ETB",
//       amount,
//       tx_ref,
//       // callback_url: "https://example.com/callback",
//       // return_url: "https://google.com/",
//       customization: {
//         title: "Demo Payment",
//         description: "This is a demo transaction",
//       },
//     });

//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Payment failed" });
//   }
// };

// export const verify = async (req, res) => {
//   const { tx_ref } = req.params;

//   try {
//     const response = await axios.get(
//       `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
//         },
//       }
//     );

//     const data = response.data;

//     if (data.status === "success") {
//       // Payment successful ✅
//       // You can update database, send email, etc.
//       res.json({
//         message: "Payment verified successfully",
//         payment: data.data,
//       });
//     } else {
//       // Payment failed or pending ❌
//       res.status(400).json({ message: "Payment verification failed", data });
//     }
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res
//       .status(500)
//       .json({ message: "Error verifying payment", error: err.message });
//   }
// };

// export const chapaCallback = async (req, res) => {
//   const { tx_ref } = req.body;

//   if (!tx_ref) {
//     return res.status(400).json({ message: "tx_ref is required" });
//   }

//   try {
//     // 1️⃣ Verify payment with Chapa
//     const response = await axios.get(
//       `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
//       }
//     );

//     const data = response.data.data;

//     if (!data || data.status !== "success") {
//       return res.status(400).json({ message: "Payment not successful", data });
//     }

//     // 2️⃣ Find Payment record in DB
//     const payment = await Payment.findOne({ tx_ref }).populate("order");

//     if (!payment) {
//       return res.status(404).json({ message: "Payment record not found" });
//     }

//     // ✅ Idempotent: check if already successful
//     if (payment.status === "SUCCESS") {
//       return res.sendStatus(200); // Already processed
//     }

//     // 3️⃣ Update Payment record
//     payment.status = "SUCCESS";
//     payment.chapaRef = data.reference;
//     payment.amount = data.amount;
//     payment.currency = data.currency;
//     await payment.save();

//     // 4️⃣ Update Order record
//     const order = await Order.findById(payment.order._id);
//     order.paymentStatus = "paid";
//     await order.save();

//     // 5️⃣ Generate tickets
//     const event = await Event.findById(order.event);
//     for (let i = 0; i < order.quantity; i++) {
//       await Ticket.create({
//         event: event._id,
//         user: order.user,
//         order: order._id,
//         ticketType: order.ticketType,
//         price: order.price,
//         ticketCode: `TICKET-${Date.now()}-${i}`,
//       });
//     }

//     // 6️⃣ Respond to Chapa
//     res.sendStatus(200);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.sendStatus(500); // Chapa will retry webhook if not 200
//   }
// };

export const pay = async (req, res) => {
  const { orderId, first_name, last_name, phone_number } = req.body;

  if (!orderId || !first_name || !last_name || !phone_number) {
    return res.status(400).json({ message: "Missing required payment fields" });
  }
  // console.log(orderId, first_name, last_name, email, phone_number, amount);

  try {
    // Format phone number for Chapa (Ethiopian format)
    let formattedPhone = phone_number.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+251" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+251" + formattedPhone;
    }

    // const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tx_ref = await chapa.genTxRef();

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const amount = order.totalAmount;
    // 3️⃣ Create Payment record in DB (status = PENDING)
    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      tx_ref,
      amount,
      currency: "ETB",
      status: "PENDING",
    });

    // 4️⃣ Update Order with payment info
    order.paymentStatus = "pending";
    await order.save();

    const response = await chapa.initialize({
      first_name,
      last_name,
      phone_number: formattedPhone,
      currency: "ETB",
      amount: String(amount),
      tx_ref: tx_ref,
      callback_url: `${
        process.env.BASE_URL || "https://capstone-backend-focn.onrender.com"
      }/api/payment/callback/${tx_ref}`,
      customization: {
        title: "Test Title",
        description: "Test Description",
      },
    });

    res.json({ checkout_url: response.data?.checkout_url, tx_ref, payment });
  } catch (err) {
    console.error("Payment initialization error:", err);
    console.error("Error details:", err.response?.data || err.message);

    res.status(500).json({
      error: "Payment initialization failed",
      details: err.response?.data || err.message,
    });
  }
};

export const verify = async (req, res) => {
  const { tx_ref } = req.params; // frontend sends tx_ref

  try {
    // 1️⃣ Verify payment with Chapa
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    const data = response.data.data;

    if (!data || data.status !== "success") {
      // Payment failed or pending
      return res.status(400).json({ message: "Payment not successful", data });
    }

    // 2️⃣ Find Payment record
    const payment = await Payment.findOne({ tx_ref }).populate("order");
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    // 3️⃣ Idempotency check: already successful?
    if (payment.status === "SUCCESS") {
      return res.json({ message: "Payment already verified", payment });
    }

    // 4️⃣ Update Payment record
    payment.status = "SUCCESS";
    payment.chapaRef = data.reference;
    payment.amount = data.amount;
    payment.currency = data.currency;
    await payment.save();

    // 5️⃣ Update Order record
    const order = await Order.findById(payment.order._id);
    order.paymentStatus = "paid";
    await order.save();

    // 6️⃣ Generate tickets
    const event = await Event.findById(order.event);
    for (let i = 0; i < order.quantity; i++) {
      await Ticket.create({
        event: event._id,
        user: order.user,
        order: order._id,
        ticketType: order.ticketType,
        price: order.price,
        ticketCode: `TICKET-${Date.now()}-${i}`,
      });
    }

    // 7️⃣ Return success to frontend
    res.json({
      message: "Payment verified successfully",
      // payment,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ message: "Error verifying payment", error: err.message });
  }
};

export const chapaCallback = async (req, res) => {
  const { tx_ref } = req.params;
  console.log(tx_ref);
  if (!tx_ref) {
    return res.status(400).json({ message: "tx_ref is required" });
  }

  try {
    // 1️⃣ Verify payment with Chapa
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    const data = response.data.data;

    if (!data || data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful", data });
    }

    // 2️⃣ Find Payment record
    const payment = await Payment.findOne({ tx_ref }).populate("order");
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    // 3️⃣ Idempotency check
    if (payment.status === "SUCCESS") {
      return res.sendStatus(200); // Already processed
    }

    // 4️⃣ Update Payment
    payment.status = "SUCCESS";
    payment.chapaRef = data.reference;
    payment.amount = data.amount;
    payment.currency = data.currency;
    await payment.save();

    // 5️⃣ Update Order
    const order = await Order.findById(payment.order._id);
    order.paymentStatus = "paid";
    await order.save();

    // 6️⃣ Generate Tickets
    const event = await Event.findById(order.event);
    for (let i = 0; i < order.quantity; i++) {
      await Ticket.create({
        event: event._id,
        user: order.user,
        order: order._id,
        ticketType: order.ticketType,
        price: order.price,
        ticketCode: `TICKET-${Date.now()}-${i}`,
      });
    }

    // 7️⃣ Respond to Chapa
    res.sendStatus(200).json({
      message: "Payment processed successfully",
      payment,
      order,
      event,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
};
