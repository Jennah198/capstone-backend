import mongoose from "mongoose";

const { Schema } = mongoose;

/* ======================================================
   USER MODEL
====================================================== */

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
    phone: String,
    profilePic: String,
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);

/* ======================================================
   EVENT MODEL
====================================================== */

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    image: { type: String, default: "" },
    normalPrice: {
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
    },
    vipPrice: {
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
    },
    totalTicketsSold: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", EventSchema);

/* ======================================================
   CATEGORY MODEL
====================================================== */

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    image: String,
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", CategorySchema);

/* ======================================================
   VENUE MODEL
====================================================== */

const VenueSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: "" },
    address: String,
    city: String,
    country: String,
    capacity: Number,
  },
  { timestamps: true }
);

export const Venue = mongoose.model("Venue", VenueSchema);

/* ======================================================
   ORDER MODEL
====================================================== */

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    ticketType: { type: String, enum: ["normal", "vip"] },
    price: Number,
    quantity: Number,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);

/* ======================================================
   TICKET MODEL
====================================================== */

const TicketSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    ticketType: { type: String, enum: ["normal", "vip"], required: true },
    price: { type: Number, required: true },
    qrCode: String,
    ticketCode: { type: String, default: "" },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", TicketSchema);

/* ======================================================
   PAYMENT MODEL
====================================================== */

const PaymentSchema = new Schema(
  {
    // Chapa reference (main key)
    tx_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    chapaRef: {
      type: String, // Chapa "reference"
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "ETB",
    },

    charge: Number,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    paymentMethod: String, // test, card, mobile
    mode: String, // test | live

    // Relations
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", PaymentSchema);

/* ======================================================
   MEDIA MODEL
====================================================== */

const MediaSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], default: "image" },
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", MediaSchema);

/* ======================================================
   SUPPLIER MODEL
====================================================== */

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "photographer",
        "videographer",
        "decorator",
        "venue_planner",
        "choreographer",
        "designer",
        "makeup_artist",
        "bar_services",
      ],
      required: true,
    },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    image: { type: String, default: "" },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviews: { type: Number, default: 0 },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", SupplierSchema);
