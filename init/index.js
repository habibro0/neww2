const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/KhasMayar";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


async function updateCategoryName() {
  try {
    const result = await Listing.updateMany(
      {},
      { $rename: { 'category': 'categoryList' } }
    );
    console.log(`${result.modifiedCount} documents updated successfully!`);
  } catch (err) {
    console.log("Error updating category field:", err);
  }
}


const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '67a9c4c2afe095ba355ab33f',
    pricePak: obj.pricePak || 0,
    priceUae: obj.priceUae || 0,
    priceUsa: obj.priceUsa || 0,
    image: {
      filename: obj.image.filename || "default.png",  // ✅ Ensure filename exists
      url: obj.image.url || "/images/default.png"    // ✅ Ensure URL exists
    }

  }));
  
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();

