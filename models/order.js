const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }, // Referencing Listing collection
      quantity: { type: Number, required: true }
    }
  ],
  status: { type: String, default: 'Pending' }, // Order status
  createdAt: { type: Date, default: Date.now, expires: 86400 },  // Order creation time
});

// Adding a method to populate product details in the order
orderSchema.methods.populateProductDetails = async function() {
  for (let item of this.items) {
    item.productId = await item.populate('productId', 'title price'); // Populating the title and price of product
  }
};

module.exports = mongoose.model('Order', orderSchema);











// if(process.env.NODE_ENV !== 'production'){
//   require("dotenv").config();
  
//   }
  
  
  
//   const express = require("express");
  
//   const app = express();
//   const mongoose = require("mongoose");
//   const Listing = require("./models/listing.js");
//   const path = require("path");
//   const methodOverride = require("method-override");
//   const ejsMate = require("ejs-mate");
//   const multer = require("multer");
//   const Order = require('./models/order');
//   const bodyParser = require('body-parser');
//   const ExpressError = require("./utils/ExpressError.js")
//   const Review = require("./models/review.js");
//   const cookieParser = require("cookie-parser");
//   const session = require("express-session");
//   const MongoStore = require("connect-mongo")
//   const flash = require("connect-flash");
//   const passport = require("passport");
//   const geoip = require("geoip-lite");
//   const axios = require('axios');
//   const Localstrategy = require("passport-local");
//   const User = require("./models/user.js")
//   const { CloudinaryStorage } = require("multer-storage-cloudinary");
  
//   const cloudinary = require("cloudinary").v2;
//   const {isLoggedIn,isOwner,isReviewAuthor, isAuthorizedUser} = require("./middleware.js")
  
  
//   // MongoDB URL
//   // const MONGO_URL = "mongodb://127.0.0.1:27017/KhasMayar";
//   const MONGO_URL = process.env.ATLASDB_URL;
  
//   // Connect to DB
//   async function main() {
//     try {
//       await mongoose.connect(MONGO_URL);
//       console.log("connected to DB");
//     } catch (err) {
//       console.log("DB Connection Error:", err);
//     }
//   }
  
//   main();
  
//   app.set("view engine", "ejs");
//   app.set("views", path.join(__dirname, "views"));
//   app.use(express.urlencoded({ extended: true }));
  
//   app.use(express.urlencoded({ extended: true })); // یہ ضروری ہے!
//   app.use(cookieParser("secretcode"))
//   app.use(express.json()); // To parse JSON bodies
//   app.use(methodOverride("_method"));
//   app.engine('ejs', ejsMate);
//   app.use(bodyParser.json());
//   app.use(express.static(path.join(__dirname, "/public")));
  
//   const store = MongoStore.create({
//     mongoUrl: MONGO_URL,
//     crypto:{
//       secret:"mykhaasmayarlovely",
//     },
//     touchAfter: 24 * 3600
//   })
  
//   store.on("error",(err) =>{
//     console.log("session store error",err)
//   })
  
  
//   const sessionOptions = {
//     store,
//     secret: "mykhaasmayarlovely",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true
//     }
//   };
  
//   app.use(session(sessionOptions)); // ✅ پہلے سیشن لوڈ کرو
  
//   // 🌍✅ User Location Middleware (Only Once)
  
  
//   app.use(flash());
//   app.use(passport.initialize());
//   app.use(passport.session());
//   passport.use(new Localstrategy(User.authenticate()));
//   passport.serializeUser(User.serializeUser());
//   passport.deserializeUser(User.deserializeUser());
  
//   // 🌍✅ Global Variables for EJS
//   app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currentUser = req.user;
//     res.locals.userLocation = req.session.userLocation;
//     next();
//   });
  
//   // ✅ Live Exchange Rates API
  
//   // ✅ Currency Converter Middleware
  
  
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
//   });
  
//   // چیک کریں کہ Cloudinary صحیح configure ہوا ہے یا نہیں
//   console.log("Cloudinary Config:", cloudinary.config());
  
  
  
  
//   app.get('/signup', (req, res) => {
//     res.render('users/signup.ejs');
//   })
  
//   app.post('/signup', async (req, res) => {
//     console.log(req.body); // چیک کریں کہ username اور email موجود ہیں یا نہیں
  
//     let { username, email, password } = req.body;
  
//     if (!username || !email) {
//       req.flash('error', "Username and Email are required!");
//       return res.redirect("/signup"); 
//     }
  
//     try {
//       const registeredUser = await User.register(new User({ username, email }), password);
      
//       // req.login ایک callback-based فنکشن ہے، اس کو promise-based طریقے سے handle کریں
//       req.login(registeredUser, (err) => {
//         if (err) {
//           console.log(err);
//           req.flash('error', "Login failed after registration.");
//           return res.redirect("/signup"); 
//         }
  
//         req.flash('success', "Successfully registered!");
//         return res.redirect("/listings"); // ✅ صرف ایک بار redirect
//       });
  
//     } catch (err) {
//       console.log(err);
//       req.flash('error', err.message);
//       return res.redirect("/signup"); 
//     }
//   });
  
//   // ✅ Favorite ایڈ یا ریموو کرنے کا روٹ
  
//   app.get('/login', (req, res) => {
//     res.render('users/login.ejs');
//   })
  
//   app.post("/login",passport.authenticate("local",{failureRedirect: "/login", failureFlash: true}), async(req, res) => {
//     req.flash('success', "welcome Logged in successfully!");
//     res.redirect("/listings");
//   })
  
//   app.get("/logout", (req, res,next) => {
//     req.logout((err)=>{
//       if(err){
//         next(err)
//       }
//   req.flash("success","Your  are logged out")
//   res.redirect("/listings")
//     });
//   })
  
//   // Cloudinary کے لیے storage setup کریں
//   const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: "uploads",  // یہ Cloudinary میں وہ فولڈر ہوگا جہاں امیجز جائیں گی
//       allowed_formats: ["jpg", "png", "jpeg"]
//     },
//   });
  
//   // Multer کے ساتھ Cloudinary storage کو لنک کریں
//   const upload = multer({ storage: storage });
  
//   // Set up multer for image upload
//   app.post('/favorite/:id', async (req, res) => {
//     if (!req.user) {  
//         return res.json({ success: false, redirect: "/login" });  
//     }
  
//     if (!req.session.favorites) {
//         req.session.favorites = [];
//     }
  
//     const item = await Listing.findById(req.params.id);
//     if (!item) {
//         return res.json({ success: false, message: "Item not found" });
//     }
  
//     const exists = req.session.favorites.some(fav => fav.id === item._id.toString());
  
//     if (!exists) {
//         req.session.favorites.push({ 
//             id: item._id.toString(), 
//             title: item.title,  
//             image: item.image 
//         });
//     } else {
//         req.session.favorites = req.session.favorites.filter(fav => fav.id !== item._id.toString());
//     }
  
//     res.json({ success: true, favorited: !exists, favorites: req.session.favorites });
//   });
  
//   // ✅ یہ Route یوزر کی Favorites واپس کرے گا
//   app.get('/get-favorites', (req, res) => {
//     res.json({ favorites: req.session.favorites || [] });
//   });
  
  
//   app.get('/get-favorites', (req, res) => {
//     if (!req.user) {  
//         return res.json({ favorites: [] });  // ❌ اگر یوزر لاگ ان نہیں ہے، تو لسٹ خالی بھیجیں
//     }
    
//     res.json({ favorites: req.session.favorites || [] });
//   });
  
  
  
//   // Index Route
//   app.get("/listings", async (req, res) => {
//     try {
//       const allListings = await Listing.find({});
//       console.dir(req.cookies)
//       res.render("listings/index.ejs", { 
//         allListings, 
//         showSlidebar: true // Sidebar ko enable kiya
//       });
//     } catch (err) {
//       console.log("Error fetching listings:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // New Route (form to create a new listing)
//   app.get("/listings/new",isLoggedIn, isAuthorizedUser, (req, res) => {
  
//     res.render("listings/new.ejs");
//   });
  
//   // Show Route (for each listing)
//   app.get("/listings/:id", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const listing = await Listing.findById(id)
//         .populate({
//           path: "reviews",
//           populate: {
//             path: "author",
//             select: "username", // ✅ صرف username لوڈ کریں
//           },
//         })
//         .populate("owner");
  
//       if (!listing) {
//         req.flash("error", "does not exist");
//         return res.redirect("/listings");
//       }
  
//       // ✅ Null check before accessing location
//       if (listing.location && Array.isArray(listing.location)) {
//         listing.location = listing.location.join(", ");
//       }
  
//       // ✅ Related items category کے مطابق لاؤ
//       const relatedItems = await Listing.find({
//         category: listing.category, // وہی category کے باقی items نکالو
//         _id: { $ne: listing._id }, // جو current item ہے وہ شامل نہ ہو
//       }).limit(4);
  
//       console.log("Related Items:", relatedItems); // Debugging کے لیے
  
//       res.render("listings/show", { listing, relatedItems }); // ✅ relatedItems ساتھ بھیج رہے ہیں
//     } catch (err) {
//       console.log("Error fetching listing:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
  
  
//   app.post("/listings", isLoggedIn, upload.single("image"), async (req, res) => {
//     try {
//       console.log("Received Data:", req.body);
  
//       // ✅ Category Check
//       if (!req.body.listing || !req.body.listing.category) {
//         req.flash("error", "Category is required!");
//         return res.redirect("/listings/new");
//       }
  
//       const newListing = new Listing(req.body.listing);
//       newListing.owner = req.user._id;
  
//       // ✅ Cloudinary کا امیج URL محفوظ کریں
//       if (req.file) {
//         console.log("Uploaded Image URL:", req.file.path); 
//         newListing.image = req.file.path;  // Cloudinary image URL
//       }
  
//       await newListing.save();
//       req.flash("success", "New listing created!");
//       res.redirect("/listings");
  
//     } catch (err) {
//       console.error("Error saving listing:", err);
//       req.flash("error", "Something went wrong! Please try again.");
//       res.status(500).redirect("/listings/new");
//     }
//   });
  
  
//   app.get("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     try {
//       const listing = await Listing.findById(id);
  
//       // Ensure the location is properly formatted if it is an array
//       if (Array.isArray(listing.location)) {
//         listing.location = listing.location.join(', ');  // Convert array to a string
//       }
  
//       res.render("listings/show.ejs", { listing });
//     } catch (err) {
//       console.log("Error fetching listing:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // Edit Route (show the edit form)
//   app.get("/listings/:id/edit",isLoggedIn,isOwner, async (req, res) => {
//     let { id } = req.params;
//     try {
//       const listing = await Listing.findById(id);
//       if (!listing) {
//         req.flash("error", "does not exist");
//         return res.redirect("/listings");  // ✅ return added
//     }
//       res.render("listings/edit.ejs", { listing });
//     } catch (err) {
//       console.log("Error fetching listing for edit:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // Update Route (update an existing listing)
//   app.put("/listings/:id",isLoggedIn,isOwner, upload.single('image'), async (req, res) => {
//     let { id } = req.params;
  
//     console.log("Request body:", req.body); // Debugging ke liye
  
//     if (Array.isArray(req.body.listing.location)) {
//       req.body.listing.location = req.body.listing.location.join(', '); 
//     }
  
//     if (req.file) {
//       req.body.listing.image = '/images/' + req.file.filename;
//     }
  
//     try {
//       await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//       req.flash("success","updated product` successfully")
  
//       res.redirect(`/listings/${id}`);
//     } catch (err) {
//       console.log("Error updating listing:", err);
//       res.status(500).send("Error updating listing");
//     }
//   });
//   app.get("/about", (req, res) => {
//     res.render("footer/about");
//   });
  
//   app.get("/services", (req, res) => {
//     res.render("footer/services");
//   });
  
//   app.get("/contact", (req, res) => {
//     res.render("footer/contact");
//   });
  
//   app.get("/location", (req, res) => {
//     res.render("footer/location");
//   });
  
//   app.get("/faq", (req, res) => {
//     res.render("footer/faqs");
//   });
//   app.get("/careers", (req, res) => {
//     res.render("footer/carrer");
//   });
//   app.get("/blog", (req, res) => {
//     res.render("footer/blogs");
//   });
//   app.get("/privacy-policy", (req, res) => {
//     res.render("footer/privacy-policy");
//   });
  
//   app.get("/terms-and-conditions", (req, res) => {
//     res.render("footer/terms-and-conditions");
//   });
  
  
  
  
//   app.get("/products", (req, res) => {
//     const products = [
//         { name: "Desi Ghee", image: "/images/desi-ghee.jpg" },
//         { name: "Khoya", image: "/images/khoya.jpg" },
//         { name: "Green Tea", image: "/images/green-tea.jpg" },
//         { name: "Kashmiri Tea", image: "/images/kashmiri-tea.jpg" },
//         { name: "Classic Saunf", image: "/images/classic-saunf.jpg" },
//         { name: "Sweet Saunf", image: "/images/sweet-saunf.jpg" },
//         { name: "Pure Ghee", image: "/images/pure-ghee.jpg" }
//     ];
  
//     res.render("footer/products", { products });
//   });
  
  
//   // Delete Route (delete a listing)
//   app.delete("/listings/:id",isLoggedIn,isOwner, async (req, res) => {
//     let { id } = req.params;
//     try {
//       let deletedListing = await Listing.findByIdAndDelete(id);
//       console.log(deletedListing);
//       req.flash("success","new listing Delete")
  
//       res.redirect("/listings");
//     } catch (err) {
//       console.log("Error deleting listing:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   app.post("/listings/:id/reviews",isLoggedIn, async (req, res) => {
   
//         // 1️⃣ لسٹنگ تلاش کریں
//         let listing = await Listing.findById(req.params.id);
//         if (!listing) {
//             return res.status(404).send("Listing not found");
//         }
  
//         // 2️⃣ نیا ریویو بنائیں
//         let newReview = new Review(req.body.review);
//         newReview.author = req.user._id;
        
  
//         // 3️⃣ لسٹنگ میں ریویو شامل کریں
//         listing.reviews.push(newReview);
  
//         // 4️⃣ ڈیٹا بیس میں محفوظ کریں
//         await newReview.save();
//         await listing.save();
//         req.flash("success","Review added")
  
//         // 5️⃣ ری ڈائریکٹ کریں
//         res.redirect(`/listings/${listing._id}`);
    
//   });
  
  
//   // delete reviews  
//   app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, async (req, res) => {
//     try {
//         let { id, reviewId } = req.params;
  
//         // ✅ Remove review reference from Listing
//         await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
//         // ✅ Delete review from DB
//         await Review.findByIdAndDelete(reviewId);
  
//         req.flash("success", "Review deleted successfully");
//         res.redirect(`/listings/${id}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error deleting review");
//     }
//   });
  
  
//   // Index Route (Modified to handle category filter)
//   app.get("/listings", async (req, res) => {
//     try {
//       const category = req.query.category || "All Items";
//       let listings = category !== "All Items" ? await Listing.find({ category }) : await Listing.find({});
//       res.render("listings/index", { allListings: listings, selectedCategory: category });
//     } catch (err) {
//       console.log("Error fetching listings:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   });
  
//   // New Listing Form
//   app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
//   });
  
//   // Create Listing
//   app.post("/listings", upload.single('image'), async (req, res) => {
//     try {
//       console.log("Received Data:", req.body);
//       if (!req.body.listing || !req.body.listing.category) {
//         throw new Error("Category is required");
//       }
//       const newListing = new Listing(req.body.listing);
//       if (req.file) {
//         newListing.image = '/images/' + req.file.filename;
//       }
//       await newListing.save();
//       res.redirect("/listings");
//     } catch (err) {
//       console.log("Error saving listing:", err);
//       res.status(400).send("Listing validation failed");
//     }
//   });
  
//   app.get("/listings", async (req, res) => {
//     const { category } = req.query;  // Get category from URL query parameter
  
//     if (category && category !== "All Items") {
//       // If a category is selected, find listings that match the selected category
//       const filteredListings = await Listing.find({ category: category });
//       res.render("listings/index", { allListings: filteredListings, selectedCategory: category });
//     } else {
//       // If no category is selected, or "All Items" is selected, show all listings
//       const allListings = await Listing.find({});
//       res.render("listings/index", { allListings, selectedCategory: "All Items" });
//     }
//   });
  
//   app.get("/greets",(req,res)=>{
//     let {name = "anonymus"} = req.cookies
//     res.send(`hi ${name}`)
//   })
  
  
//   app.get("/getsignedcookies",(req,res)=>{
//     res.cookie("made-in","india" , {signed:true})
//     res.send("send cookie")
//   })
  
//   app.get("/verify",(req,res)=>{
//     console.log(req.signedCookies);
//     res.send("verfied cookies")
  
    
//   })
//   // Cart logic: Using a simple array for now (can be stored in session or DB)
//   let cart = [];
  
//   // Add to Cart
//   app.post('/cart/add', (req, res) => {
//     try {
//       const { productId } = req.body; // Product ID from the form
//       const existingProduct = cart.find(item => item.productId === productId);
  
//       if (existingProduct) {
//         existingProduct.quantity += 1;  // Increase quantity if product already exists
//       } else {
//         cart.push({ productId, quantity: 1 });  // Add new product to cart
//       }
  
//       // Redirect to /cart after adding the item to cart
//       res.redirect('/cart');
//     } catch (err) {
//       console.log("Error adding to cart:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // View Cart
//   app.get('/cart', async (req, res) => {
//     try {
//       // Fetch details of items in cart
//       const cartDetails = await Promise.all(
//         cart.map(async (item) => {
//           const product = await Listing.findById(item.productId);
//           return { ...product.toObject(), quantity: item.quantity };
//         })
//       );
//       res.render('listings/cart.ejs', { cartDetails });
//     } catch (err) {
//       console.log("Error fetching cart:", err);
//       res.status(500).send("Server Error");
//     }
//   });
//   // Update Cart
//   app.post('/cart/update', async (req, res) => {
//     try {
//       const { productId, quantity } = req.body;
  
//       if (!productId || !quantity) {
//         return res.status(400).json({ message: 'Invalid data provided.' });
//       }
  
//       const cartItem = cart.find(item => item.productId === productId);
//       if (!cartItem) {
//         return res.status(404).json({ message: 'Product not found in cart.' });
//       }
  
//       cartItem.quantity = quantity;
  
//       const product = await Listing.findById(productId);
//       const totalPrice = product.price * cartItem.quantity;
  
//       let totalCartPrice = 0;
//       for (let item of cart) {
//         const product = await Listing.findById(item.productId);
//         totalCartPrice += product.price * item.quantity;
//       }
  
//       res.json({ quantity: cartItem.quantity, totalPrice, totalCartPrice });
//     } catch (err) {
//       console.log("Error updating cart:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // Remove from Cart
//   app.post('/cart/remove', (req, res) => {
//     try {
//       const { productId } = req.body;
//       cart = cart.filter(item => item.productId !== productId);
//       res.redirect('/cart');
//     } catch (err) {
//       console.log("Error removing from cart:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // Search Route (search listings by query)
//   app.get("/search", async (req, res) => {
//     const { query } = req.query;  // Get search query from URL
  
//     if (query) {
//       const searchResults = await Listing.find({
//         $or: [
//           { title: { $regex: query, $options: 'i' } },
//           { description: { $regex: query, $options: 'i' } },
//           { location: { $regex: query, $options: 'i' } },
//           { country: { $regex: query, $options: 'i' } }
//         ]
//       });
//       res.render("listings/index.ejs", { allListings: searchResults });
//     } else {
//       const allListings = await Listing.find({});
//       res.render("listings/index.ejs", { allListings });
//     }
//   });
  
//   // Checkout Page
//   app.get('/checkout', (req, res) => {
//     res.render('listings/checkout.ejs');
//   });
  
//   // Process Checkout
//   app.post('/checkout', async (req, res) => {
//     if (!req.isAuthenticated()) {
//       req.flash("error", "You must be logged in to place an order.");
//       return res.redirect("/login");
//     }
  
//     const { name, contact, address, city, zip } = req.body;
  
//     try {
//       const newOrder = new Order({
//         name,
//         contact,
//         address,
//         city,
//         zip,
//         items: cart,
//         user: req.user._id, // آرڈر کو یوزر سے لنک کریں
//       });
  
//       await newOrder.save();
//       cart = []; // آرڈر ہونے کے بعد کارٹ خالی کریں
  
//       res.redirect(`/order/${newOrder._id}`);
//     } catch (err) {
//       console.log("Error processing checkout:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // View Order Details
//   app.get('/order/:id', async (req, res) => {
//     const { id } = req.params;
  
//     // آرڈر لائیں
//     const order = await Order.findById(id).populate('items.productId');
  
//     if (!order) {
//       return res.status(404).send("Order not found");
//     }
  
//     // اگر 24 گھنٹے مکمل ہو گئے تو آرڈر کینسل کر دیں
//     const now = new Date();
//     const expiryTime = new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;
  
//     if (now.getTime() > expiryTime && order.status === "Pending") {
//       order.status = "Cancelled";
//       await order.save();
//     }
  
//     res.render('listings/orderDetails.ejs', { order });
//   });
  
  
//   app.get('/orders', isLoggedIn, isAuthorizedUser, async (req, res) => {
//     try {
//       const orders = await Order.find().populate("items.productId");
//       res.render("orders/allOrders.ejs", { orders });
//     } catch (err) {
//       console.log("Error fetching orders:", err);
//       res.status(500).send("Server Error");
//     }
//   });
  
//   // Search Route
//   // Search Route
  
  
  
  
//   // Start server
//   app.listen(8080, () => {
//     console.log("server is listening to port 8080");
//   });
  