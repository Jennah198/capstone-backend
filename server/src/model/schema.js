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

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: {type:String,default:""},
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required:true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required:true},
    startDate: { type: Date, required: true },
    endDate: {type:Date,default:null},
    image: {type:String,default:""},
    normalPrice :{
        price: { type: Number,default:0},
        quantity:{ type: Number,default:0}
    },
    vipPrice :{
        price: { type: Number,default:0},
        quantity:{ type: Number,default:0}
    },

    isPublished: { type: Boolean, default: false },

}, { timestamps: true });

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

const VenueSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, default: "" },
    address: String,
    city: String,
    country: String,
    capacity: Number,
}, { timestamps: true });

export const Venue = mongoose.model("Venue", VenueSchema);

/* ======================================================
   ORDER MODEL
====================================================== */

const OrderSchema = new Schema(
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

export const Order = mongoose.model("Order", OrderSchema);

/* ======================================================
   TICKET MODEL
====================================================== */

const TicketSchema = new Schema(
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

export const Ticket = mongoose.model("Ticket", TicketSchema);
