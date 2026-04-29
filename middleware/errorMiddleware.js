const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || "Internal Server Error"


    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format"
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400
        message = "Duplicate field value entered"
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401
        message = "Invalid token"
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401
        message = "Token expired"
    }

    if (process.env.NODE_ENV === 'production') {
        message = "Something went wrong"
    } else {
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message
    })
}

module.exports = errorMiddleware