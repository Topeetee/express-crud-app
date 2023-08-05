const jwt = require("jsonwebtoken");
const express = require("express");
const Error = require("./error")

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(Error(401, "You are not authenticated!"));
    }

    jwt.verify(token, process.env.secret_key, (err, user) => {
        if (err) return next(Error(403, "Token is not valid"));
        req.user = user;
        next();
    });
}

const verifyUser = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return next(Error(403, "You are not authorized"));
        }
    });
}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);

        if (req.user.isAdmin) {
            next();
        } else {
            return next(Error(403, "You are not authorized"));
        }
    });
}

module.exports = { verifyToken, verifyUser, verifyAdmin };
