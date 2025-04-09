const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
 // ✅ درست امپورٹ

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a listing.");
        return res.redirect("/login");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner) {
        req.flash("error", "This listing has no owner!");
        return res.redirect("/listings");
    }

    if (!req.user) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect("/listings");
  }

  if (!review.author.equals(req.user._id)) {  // ✅ Use req.user._id instead of res.locals
      req.flash("error", "You don't have permission to delete this review!");
      return res.redirect("back");  // ✅ Instead of listing ID, go back to last page
  }

  next();
};


module.exports.isAuthorizedUser = (req, res, next) => {
    const allowedUsers = ["faisalmotiwala", "karim", "habibro123"]; // یہاں اپنے یوزرنیم درج کریں

    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to access this page.");
        return res.redirect("/login");
    }

    if (!allowedUsers.includes(req.user.username)) {
        req.flash("error", "You do not have permission to access this page.");
        return res.redirect("/listings");
    }

    next();
};


