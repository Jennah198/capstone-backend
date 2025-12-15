import mongoose, { Schema, Document, Model } from "mongoose";

/* ======================================================
   USER MODEL
====================================================== */

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "organizer" | "admin";
  phone?: string;
  profilePic?: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
}

const UserSchema: Schema<IUser> = new Schema(
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

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

/* ======================================================
   EVENT MODEL
====================================================== */

export interface IEvent extends Document {
  title: string;
  description?: string;
  organizer: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  venue?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  images?: string;
  normalPrice?: {
    price?: number;
    quantity?: number;
  };
  vipPrice?: {
    price?: number;
    quantity?: number;
  };
  isPublished: boolean;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    venue: { type: Schema.Types.ObjectId, ref: "Venue" },
    startDate: { type: Date, required: true },
    endDate: Date,
    images: String,
    normalPrice: {
      price: Number,
      quantity: Number,
    },
    vipPrice: {
      price: Number,
      quantity: Number,
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = mongoose.model<IEvent>("Event", EventSchema);

/* ======================================================
   CATEGORY MODEL
====================================================== */

export interface ICategory extends Document {
  name: string;
  image?: string;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    image: String,
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);

/* ======================================================
   VENUE MODEL
====================================================== */

export interface IVenue extends Document {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
}

const VenueSchema: Schema<IVenue> = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    country: String,
    capacity: Number,
  },
  { timestamps: true }
);

export const Venue: Model<IVenue> = mongoose.model<IVenue>(
  "Venue",
  VenueSchema
);

/* ======================================================
   ORDER MODEL
====================================================== */

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  tickets: {
    ticketType: "normal" | "vip";
    quantity: number;
    price: number;
  }[];
  totalAmount?: number;
  paymentStatus: "pending" | "paid" | "failed";
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [
      {
        ticketType: { type: String, enum: ["normal", "vip"] },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = mongoose.model<IOrder>(
  "Order",
  OrderSchema
);

/* ======================================================
   TICKET MODEL
====================================================== */

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  ticketType: "normal" | "vip";
  price: number;
  qrCode?: string;
  isUsed: boolean;
}

const TicketSchema: Schema<ITicket> = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketType: {
      type: String,
      enum: ["normal", "vip"],
      required: true,
    },
    price: { type: Number, required: true },
    qrCode: String,
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Ticket: Model<ITicket> = mongoose.model<ITicket>(
  "Ticket",
  TicketSchema
);
