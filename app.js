if(process.env.NODE_ENV !== 'production'){
  require("dotenv").config();
  
  }
  
  

  const express = require("express");
  
  const app = express();
  const mongoose = require("mongoose");
  const Listing = require("./models/listing.js");
  const path = require("path");
  const methodOverride = require("method-override");
  const ejsMate = require("ejs-mate");
  const multer = require("multer");
  const Order = require('./models/order');
  const bodyParser = require('body-parser');
  const ExpressError = require("./utils/ExpressError.js")
  const Review = require("./models/review.js");
  const cookieParser = require("cookie-parser");
  const session = require("express-session");
  const MongoStore = require("connect-mongo")
  const flash = require("connect-flash");
  const passport = require("passport");
  const geoip = require("geoip-lite");
  const axios = require('axios');
  const Localstrategy = require("passport-local");
  const User = require("./models/user.js")
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  
  const cloudinary = require("cloudinary").v2;
  const {isLoggedIn,isOwner,isReviewAuthor, isAuthorizedUser} = require("./middleware.js")
  
  
  // MongoDB URL
  // const MONGO_URL = "mongodb://127.0.0.1:27017/KhasMayar";
  // const MONGO_URL = process.env.ATLASDB_URL;
  const MONGO_URL = process.env.ATLASDB_URL;

  // Connect to DB
  async function main() {
    try {
      await mongoose.connect(MONGO_URL);
      console.log("connected to DB");
    } catch (err) {
      console.log("DB Connection Error:", err);
    }
  }
  
  main();
  
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.urlencoded({ extended: true }));
  
  app.use(express.urlencoded({ extended: true })); // یہ ضروری ہے!
  app.use(cookieParser("secretcode"))
  app.use(express.json()); // To parse JSON bodies
  app.use(methodOverride("_method"));
  app.engine('ejs', ejsMate);
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, "/public")));
  
  const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto:{
      secret:"glasseswearlovely",
    },
    touchAfter: 24 * 3600
  })
  
  store.on("error",(err) =>{
    console.log("session store error",err)
  })
  

  const sessionOptions = {
    store,
    secret: "glasseswearlovely",  // Should ideally be an environment variable
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  };

  
  app.use(session(sessionOptions)); // ✅ پہلے سیشن لوڈ کرو
  
  // 🌍✅ User Location Middleware (Only Once)


  const deleteOldOrders = async () => {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() - 24); // 24 گھنٹے پہلے کا وقت
  
    await Order.deleteMany({ createdAt: { $lte: expiryTime } });
  
    console.log("Deleted old orders!");
  };
  
  // ہر 1 گھنٹے بعد چیک کرے گا کہ پرانے آرڈرز ڈیلیٹ کرنے ہیں یا نہیں
  setInterval(deleteOldOrders, 60 * 60 * 1000); // ⏳ 1 گھنٹہ
  
  
  
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new Localstrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  // 🌍✅ Global Variables for EJS
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.userLocation = req.session.userLocation;
    next();
  });
  app.use((req, res, next) => {
    if (!req.session.cart) {
      req.session.cart = [];  // Initialize empty cart if not present
    }
    next();
  });
  
  app.use(async (req, res, next) => {
    if (req.user && ["faisalmotiwala", "karim", "habibro123"].includes(req.user.username)) {
        try {
            const pendingOrders = await Order.countDocuments({ status: "Pending" });
            console.log("Pending Orders Count:", pendingOrders); // ✅ Debugging
            res.locals.pendingOrders = pendingOrders;
        } catch (err) {
            console.log("Error fetching orders:", err);
            res.locals.pendingOrders = 0;
        }
    } else {
        res.locals.pendingOrders = 0;
    }
    next();
});

  // ✅ Live Exchange Rates API
  
  // ✅ Currency Converter Middleware
  
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  // چیک کریں کہ Cloudinary صحیح configure ہوا ہے یا نہیں
  console.log("Cloudinary Config:", cloudinary.config());
  
  



app.get('/', async (req, res) => {
  try {
      const newArrivals = await Listing.find({ category: 'New Arrivals' }).limit(20);
      const listings = await Listing.find({});
      res.render('index', { listings, newArrivals });
  } catch (err) {
      console.error(err);
      res.send('Error loading homepage');
  }
});
app.get('/category/:categoryName', async (req, res) => {
  const categoryName = req.params.categoryName;

  try {
      let filteredListings;
      
      if (categoryName === 'New Arrivals') {
          // Special logic for New Arrivals
          filteredListings = await Listing.find()
              .sort({ createdAt: -1 })
              .limit(20);
      } else {
          // Normal category filter
          filteredListings = await Listing.find({ category: categoryName });
      }

      res.render('listings/category', { categoryName, filteredListings });
  } catch (err) {
      console.error(err);
      res.send('Error fetching listings');
  }
});



  
  app.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
  })
  
  app.post('/signup', async (req, res) => {
    console.log(req.body); // چیک کریں کہ username اور email موجود ہیں یا نہیں
  
    let { username, email, password } = req.body;
  
    if (!username || !email) {
      req.flash('error', "Username and Email are required!");
      return res.redirect("/signup"); 
    }
  
    try {
      const registeredUser = await User.register(new User({ username, email }), password);
      
      // req.login ایک callback-based فنکشن ہے، اس کو promise-based طریقے سے handle کریں
      req.login(registeredUser, (err) => {
        if (err) {
          console.log(err);
          req.flash('error', "Login failed after registration.");
          return res.redirect("/signup"); 
        }
  
        req.flash('success', "Successfully registered!");
        return res.redirect("/listings"); // ✅ صرف ایک بار redirect
      });
  
    } catch (err) {
      console.log(err);
      req.flash('error', err.message);
      return res.redirect("/signup"); 
    }
  });
  
  // ✅ Favorite ایڈ یا ریموو کرنے کا روٹ
  
  app.get('/login', (req, res) => {
    res.render('users/login.ejs');
  })
  
  app.post("/login",passport.authenticate("local",{failureRedirect: "/login", failureFlash: true}), async(req, res) => {
    req.flash('success', "welcome Logged in successfully!");
    res.redirect("/listings");
  })
  
  app.get("/logout", (req, res,next) => {
    req.logout((err)=>{
      if(err){
        next(err)
      }
  req.flash("success","Your  are logged out")
  res.redirect("/listings")
    });
  })
  
  // Cloudinary کے لیے storage setup کریں
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "uploads",  // یہ Cloudinary میں وہ فولڈر ہوگا جہاں امیجز جائیں گی
      allowed_formats: ["jpg", "png", "jpeg"]
    },
  });
  
  // Multer کے ساتھ Cloudinary storage کو لنک کریں

  const upload = multer({ storage: storage }).fields([
    { name: "image", maxCount: 1 },
    { name: "top", maxCount: 1 },
    { name: "bottom", maxCount: 1 },
    { name: "left", maxCount: 1 },
    { name: "right", maxCount: 1 }
]);

  

  // Set up multer for image upload
  app.post('/favorite/:id', async (req, res) => {
    if (!req.user) {  
        return res.json({ success: false, redirect: "/login" });  
    }
  
    if (!req.session.favorites) {
        req.session.favorites = [];
    }
  
    const item = await Listing.findById(req.params.id);
    if (!item) {
        return res.json({ success: false, message: "Item not found" });
    }
  
    const exists = req.session.favorites.some(fav => fav.id === item._id.toString());
  
    if (!exists) {
        req.session.favorites.push({ 
            id: item._id.toString(), 
            title: item.title,  
            image: item.image 
        });
    } else {
        req.session.favorites = req.session.favorites.filter(fav => fav.id !== item._id.toString());
    }
  
    res.json({ success: true, favorited: !exists, favorites: req.session.favorites });
  });
  
  // ✅ یہ Route یوزر کی Favorites واپس کرے گا
  app.get('/get-favorites', (req, res) => {
    res.json({ favorites: req.session.favorites || [] });
  });
  
  
  app.get('/get-favorites', (req, res) => {
    if (!req.user) {  
        return res.json({ favorites: [] });  // ❌ اگر یوزر لاگ ان نہیں ہے، تو لسٹ خالی بھیجیں
    }
    
    res.json({ favorites: req.session.favorites || [] });
  });
  app.post("/listings/:id/like", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        listing.likes = (listing.likes || 0) + 1;
        await listing.save();

        res.json({ success: true, likes: listing.likes });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/listings/:id/dislike", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        listing.likes = Math.max((listing.likes || 0) - 1, 0); // 0 سے نیچے نہ جائے
        await listing.save();

        res.json({ success: true, likes: listing.likes });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  
  // Index Route
  app.get("/listings", async (req, res) => {
    try {
      const allListings = await Listing.find({});
      console.dir(req.cookies)
      res.render("listings/index.ejs", { 
        allListings, 
        showSlidebar: true // Sidebar ko enable kiya
      });
    } catch (err) {
      console.log("Error fetching listings:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // New Route (form to create a new listing)
  app.get("/listings/new",isLoggedIn, isAuthorizedUser, (req, res) => {
  
    res.render("listings/new.ejs");
  });
  
  // Show Route (for each listing)
  app.get("/listings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id)
        .populate({
          path: "reviews",
          populate: {
            path: "author",
            select: "username", // ✅ صرف username لوڈ کریں
          },
        })
        .populate("owner");
  
      if (!listing) {
        req.flash("error", "does not exist");
        return res.redirect("/listings");
      }
  
      // ✅ Null check before accessing location
      if (listing.location && Array.isArray(listing.location)) {
        listing.location = listing.location.join(", ");
      }
  
      // ✅ Related items category کے مطابق لاؤ
      const relatedItems = await Listing.find({
        category: listing.category, // وہی category کے باقی items نکالو
        _id: { $ne: listing._id }, // جو current item ہے وہ شامل نہ ہو
      }).limit(4);
  
      console.log("Related Items:", relatedItems); // Debugging کے لیے
  
      res.render("listings/show", { listing, relatedItems }); // ✅ relatedItems ساتھ بھیج رہے ہیں
    } catch (err) {
      console.log("Error fetching listing:", err);
      res.status(500).send("Server Error");
    }
  });
  
  
  
  app.put("/listings/:id", isLoggedIn, isOwner, upload, async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        console.log("🔍 Editing Listing ID:", id);
        console.log("📷 Old Image:", listing.image);
        console.log("📤 Uploaded Files:", req.files);

        // ✅ اگر نئی تصویر نہ ہو، تو پرانی تصویر رکھیں
        if (req.files) {
            if (req.files["image"]) {
                req.body.listing.image = req.files["image"][0].path;
            } else {
                req.body.listing.image = listing.image;
            }
            if (req.files["top"]) {
                req.body.listing.top = req.files["top"][0].path;
            } else {
                req.body.listing.top = listing.top;
            }
            if (req.files["bottom"]) {
                req.body.listing.bottom = req.files["bottom"][0].path;
            } else {
                req.body.listing.bottom = listing.bottom;
            }
            if (req.files["left"]) {
                req.body.listing.left = req.files["left"][0].path;
            } else {
                req.body.listing.left = listing.left;
            }
            if (req.files["right"]) {
                req.body.listing.right = req.files["right"][0].path;
            } else {
                req.body.listing.right = listing.right;
            }
        }

        console.log("✅ Updated Image Path:", req.body.listing);

        // ✅ **پرانے آئٹم کو اپڈیٹ کریں، نیا نہ بنائیں!**
        await Listing.findByIdAndUpdate(id, { $set: req.body.listing });

        req.flash("success", "Updated product successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("❌ Error updating listing:", err);
        req.flash("error", "Something went wrong! Please try again.");
        res.redirect("/listings");
    }
});

  
  
  app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    try {
      const listing = await Listing.findById(id);
  
      // Ensure the location is properly formatted if it is an array
      if (Array.isArray(listing.location)) {
        listing.location = listing.location.join(', ');  // Convert array to a string
      }
  
      res.render("listings/show.ejs", { listing });
    } catch (err) {
      console.log("Error fetching listing:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // Edit Route (show the edit form)
  app.get("/listings/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing does not exist!");
            return res.redirect("/listings");
        }

        console.log("Edit Page Image:", listing.image); // ✅ Debugging

        res.render("listings/edit.ejs", { listing });

    } catch (err) {
        console.log("Error fetching listing for edit:", err);
        res.status(500).send("Server Error");
    }
});

  // Update Route (update an existing listing)
  app.put("/listings/:id", isLoggedIn, isOwner, upload, async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        console.log("🔍 Editing Listing ID:", id); // ✅ چیک کریں کہ صحیح ID جا رہی ہے
        console.log("📷 Old Image:", listing.image);
        console.log("📤 Uploaded File:", req.file ? req.file.path : "No new image uploaded");

        // ✅ اگر نئی تصویر نہ ہو، تو پرانی تصویر رکھیں
        if (req.file) {
            req.body.listing.image = req.file.path;
        } else {
            req.body.listing.image = listing.image;
        }

        console.log("✅ Updated Image Path:", req.body.listing.image);

        // ✅ پرانے آئٹم کو **update** کریں، نیا نہ بنائیں!
        await Listing.findByIdAndUpdate(id, { $set: req.body.listing });

        req.flash("success", "Updated product successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("❌ Error updating listing:", err);
        req.flash("error", "Something went wrong! Please try again.");
        res.redirect("/listings");
    }
});




  app.get("/about", (req, res) => {
    res.render("footer/about");
  });
  
  app.get("/services", (req, res) => {
    res.render("footer/services");
  });
  
  app.get("/contact", (req, res) => {
    res.render("footer/contact");
  });
  
  app.get("/location", (req, res) => {
    res.render("footer/location");
  });
  
  app.get("/faq", (req, res) => {
    res.render("footer/faqs");
  });
  app.get("/careers", (req, res) => {
    res.render("footer/carrer");
  });
  app.get("/blog", (req, res) => {
    res.render("footer/blogs");
  });
  app.get("/privacy-policy", (req, res) => {
    res.render("footer/privacy-policy");
  });
  
  app.get("/terms-and-conditions", (req, res) => {
    res.render("footer/terms-and-conditions");
  });
  
  
  
  
  app.get("/products", (req, res) => {
    const products = [
        { name: "Desi Ghee", image: "/images/desi-ghee.jpg" },
        { name: "Khoya", image: "/images/khoya.jpg" },
        { name: "Green Tea", image: "/images/green-tea.jpg" },
        { name: "Kashmiri Tea", image: "/images/kashmiri-tea.jpg" },
        { name: "Classic Saunf", image: "/images/classic-saunf.jpg" },
        { name: "Sweet Saunf", image: "/images/sweet-saunf.jpg" },
        { name: "Pure Ghee", image: "/images/pure-ghee.jpg" }
    ];
  
    res.render("footer/products", { products });
  });
  app.delete("/listings/:id", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    try {
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    } catch (err) {
        console.log("Error deleting listing:", err);
        res.status(500).send("Server Error");
    }
});

app.delete("/order/:id", async (req, res) => {
  try {
      const orderId = req.params.id;
      await Order.findByIdAndDelete(orderId);
      res.json({ success: true });
  } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ success: false });
  }
});
app.get("/users", isAuthorizedUser, async (req, res) => {
  try {
      const users = await User.find({}, "username email"); // صرف username اور email لیں
      res.render("listings/users/users", { users });
  } catch (err) {
      console.error(err);
      req.flash("error", "Something went wrong.");
      res.redirect("/");
  }
});

    app.post("/listings/:id/reviews",isLoggedIn, async (req, res) => {
   
        // 1️⃣ لسٹنگ تلاش کریں
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
  
        // 2️⃣ نیا ریویو بنائیں
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        
  
        // 3️⃣ لسٹنگ میں ریویو شامل کریں
        listing.reviews.push(newReview);
  
        // 4️⃣ ڈیٹا بیس میں محفوظ کریں
        await newReview.save();
        await listing.save();
        req.flash("success","Review added")
  
        // 5️⃣ ری ڈائریکٹ کریں
        res.redirect(`/listings/${listing._id}`);
    
  });
  
  
  // delete reviews  
  app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor, async (req, res) => {
    try {
        let { id, reviewId } = req.params;
  
        // ✅ Remove review reference from Listing
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
        // ✅ Delete review from DB
        await Review.findByIdAndDelete(reviewId);
  
        req.flash("success", "Review deleted successfully");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting review");
    }
  });
  
  
  // Index Route (Modified to handle category filter)
  app.get("/listings", async (req, res) => {
    try {
      const category = req.query.category || "All Items";
      let listings = category !== "All Items" ? await Listing.find({ category }) : await Listing.find({});
      res.render("listings/index", { allListings: listings, selectedCategory: category });
    } catch (err) {
      console.log("Error fetching listings:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // New Listing Form
  app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });
  
  // Create Listing
  app.post("/listings", isLoggedIn, upload, async (req, res) => {
    try {
      console.log("Received Body:", req.body);
      console.log("Received Files:", req.files);
  
      if (!req.body.listing || !req.body.listing.category) {
        req.flash("error", "Category is required!");
        return res.redirect("/listings/new");
      }
  
      // Manually set image fields from req.files
      if (req.files) {
        if (req.files["image"]) {
          req.body.listing.image = req.files["image"][0].path;
        }
        if (req.files["top"]) {
          req.body.listing.top = req.files["top"][0].path;
        }
        if (req.files["bottom"]) {
          req.body.listing.bottom = req.files["bottom"][0].path;
        }
        if (req.files["left"]) {
          req.body.listing.left = req.files["left"][0].path;
        }
        if (req.files["right"]) {
          req.body.listing.right = req.files["right"][0].path;
        }
      }
  
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
  
      await newListing.save();
      req.flash("success", "New listing created!");
      res.redirect("/listings");
  
    } catch (err) {
      console.error("Error saving listing:", err);
      req.flash("error", "Something went wrong! Please try again.");
      res.status(500).redirect("/listings/new");
    }
  });
  
  
  app.get("/listings", async (req, res) => {
    const { category } = req.query;  // Get category from URL query parameter
  
    if (category && category !== "All Items") {
      // If a category is selected, find listings that match the selected category
      const filteredListings = await Listing.find({ category: category });
      res.render("listings/index", { allListings: filteredListings, selectedCategory: category });
    } else {
      // If no category is selected, or "All Items" is selected, show all listings
      const allListings = await Listing.find({});
      res.render("listings/index", { allListings, selectedCategory: "All Items" });
    }
  });
  
  app.get("/greets",(req,res)=>{
    let {name = "anonymus"} = req.cookies
    res.send(`hi ${name}`)
  })
  
  
  app.get("/getsignedcookies",(req,res)=>{
    res.cookie("made-in","india" , {signed:true})
    res.send("send cookie")
  })
  
  app.get("/verify",(req,res)=>{
    console.log(req.signedCookies);
    res.send("verfied cookies")
  
    
  })
  // Cart logic: Using a simple array for now (can be stored in session or DB)
  app.post('/cart/add', (req, res) => {
    try {
      const { productId } = req.body;  // Product ID from the form
      const existingProduct = req.session.cart.find(item => item.productId === productId);
  
      if (existingProduct) {
        existingProduct.quantity += 1;  // Increase quantity if product already exists
      } else {
        req.session.cart.push({ productId, quantity: 1 });  // Add new product to cart
      }
  
      res.redirect('/cart');
    } catch (err) {
      console.log("Error adding to cart:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // View Cart
  app.get('/cart', async (req, res) => {
    try {
      // Fetch details of items in cart
      const cartDetails = await Promise.all(
        req.session.cart.map(async (item) => {
          const product = await Listing.findById(item.productId);
          return { ...product.toObject(), quantity: item.quantity };
        })
      );
      res.render('listings/cart.ejs', { cartDetails });
    } catch (err) {
      console.log("Error fetching cart:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // Update Cart
  app.post('/cart/update', async (req, res) => {
    try {
      const { productId, quantity } = req.body;
  
      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Invalid data provided.' });
      }
  
      const cartItem = req.session.cart.find(item => item.productId === productId);
      if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in cart.' });
      }
  
      cartItem.quantity = quantity;
  
      const product = await Listing.findById(productId);
      const totalPrice = product.price * cartItem.quantity;
  
      let totalCartPrice = 0;
      for (let item of req.session.cart) {
        const product = await Listing.findById(item.productId);
        totalCartPrice += product.price * item.quantity;
      }
  
      res.json({ quantity: cartItem.quantity, totalPrice, totalCartPrice });
    } catch (err) {
      console.log("Error updating cart:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // Remove from Cart
  app.post('/cart/remove', (req, res) => {
    try {
      const { productId } = req.body;
      req.session.cart = req.session.cart.filter(item => item.productId !== productId);
      res.redirect('/cart');
    } catch (err) {
      console.log("Error removing from cart:", err);
      res.status(500).send("Server Error");
    }
  });
  
  
  // Search Route (search listings by query)
  app.get("/search", async (req, res) => {
    const { query } = req.query;  // Get search query from URL
  
    if (query) {
      const searchResults = await Listing.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { country: { $regex: query, $options: 'i' } }
        ]
      });
      res.render("listings/index.ejs", { allListings: searchResults });
    } else {
      const allListings = await Listing.find({});
      res.render("listings/index.ejs", { allListings });
    }
  });
  
  // Checkout Page
  app.get('/checkout', (req, res) => {
    res.render('listings/checkout.ejs');
  });
  
  app.post('/checkout', async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be logged in to place an order.");
      return res.redirect("/login");
    }
  
    const cart = req.session.cart; // ✅ یہ لائن شامل کرو
  
    if (!cart || cart.length === 0) {
      req.flash("error", "Your cart is empty.");
      return res.redirect("/cart");
    }
  
    const { name, contact, address, city, zip } = req.body;
  
    try {
      const newOrder = new Order({
        name,
        contact,
        address,
        city,
        zip,
        items: cart,
        user: req.user._id,
      });
  
      await newOrder.save();
      req.session.cart = []; // ✅ Session cart کو خالی کرو
  
      res.redirect(`/order/${newOrder._id}`);
    } catch (err) {
      console.log("Error processing checkout:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // View Order Details
  app.get('/order/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const order = await Order.findById(id).populate("items.productId", "title price");
  
      if (!order) {
        return res.status(404).send("Order not found");
      }
  
      // Optional: Cancel if expired
      const now = new Date();
      const expiryTime = new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;
  
      if (now.getTime() > expiryTime && order.status === "Pending") {
        order.status = "Cancelled";
        await order.save();
      }
  
      res.render('listings/orderDetails.ejs', { order });
  
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).send("Server Error");
    }
  });
  
  
  app.get('/orders', isLoggedIn, isAuthorizedUser, async (req, res) => {
    try {
      const orders = await Order.find().populate("items.productId");
      res.render("orders/allOrders.ejs", { orders });
    } catch (err) {
      console.log("Error fetching orders:", err);
      res.status(500).send("Server Error");
    }
  });
  
  // Search Route
  // Search Route
  
  
  
  
  // Start server
  app.listen(8080, () => {
    console.log("server is listening to port 8080");
  });
  