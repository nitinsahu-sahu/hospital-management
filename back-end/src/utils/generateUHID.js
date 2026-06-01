const Counter = require("../models/Counter");

const generateUHID = async () => {
    const counter = await Counter.findOneAndUpdate(
        { key: "UHID" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return `WAFCC_${counter.seq}`;
};

module.exports = generateUHID;