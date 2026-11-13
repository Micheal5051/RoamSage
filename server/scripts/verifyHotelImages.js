const hotels = require("../data/hotels");

const withImages = hotels.filter((hotel) => typeof hotel.image === "string" && hotel.image.trim());
const withoutImages = hotels.filter((hotel) => !hotel.image);
const invalid = withImages.filter((hotel) => !/^https?:\/\/.+/i.test(hotel.image));
const duplicateIds = hotels.filter((hotel, index) => hotels.findIndex((item) => item.id === hotel.id) !== index);

console.log("Total hotels:", hotels.length);
console.log("Hotels with image URLs:", withImages.length);
console.log("Hotels without image URLs:", withoutImages.length);
console.log("Invalid image URLs:", invalid.length);
console.log("Duplicate IDs:", duplicateIds.length);

if (invalid.length || duplicateIds.length) process.exit(1);
