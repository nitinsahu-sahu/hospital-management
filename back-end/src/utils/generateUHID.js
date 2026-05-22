// utils/generateUHID.js
const User = require("../models/User");

const generateUHID = async () => {
    let UHID;
    let isUnique = false;
    const maxAttempts = 100;
    let attempts = 0;

    while (!isUnique && attempts < maxAttempts) {
        // Generate random 6-digit number
        const random = Math.floor(100000 + Math.random() * 900000);
        UHID = `WAFCC_${random}`;

        // Check if UHID already exists in database
        const existingUser = await User.findOne({ UH_ID: UHID });
        
        if (!existingUser) {
            isUnique = true;
        }
        
        attempts++;
    }

    if (!isUnique) {
        throw new Error("Unable to generate unique UHID. Please try again.");
    }

    return UHID;
};

module.exports = generateUHID;