// middlewares/validate.middleware.js

const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        // First error only
        const firstError = errors.array()[0];

        return res.status(400).json({
            success: false,
            message: firstError.msg,
            field: firstError.path,
        });
    }

    next();
};