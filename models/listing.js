const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },

    top:  String,
    bottom:  String,
    left:   String,
    right:   String,


  tryOnAsset: { type: String }, 
  country: String,
  location: String,
  stock: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  price: { type: Number, required: true },
 

  
  category: {
    type: String,
 // یہ فیلڈ ضروری ہے
    enum: ["Men Eyeglasses",
"Women Eyeglasses",
 "Kids Eyeglasses",
"Sunglasses",
"Sports & Safety Glasses",
"Blue Light Glasses",
"New Arrivals", 
"Prescription Glasses"], // Allowed categories
  },
  company: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref: "Review"  
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now // Yeh zaroori hai sorting ke liye
},
likes: { type: Number, default: 20 },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id : {$in: listing.reviews }})
  }
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
