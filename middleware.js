const express = require("express");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json({ type: "application/json" });
const urlencoded = bodyParser.urlencoded({ extended: false });

function setCorsHeaders(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
}

module.exports = { jsonParser, setCorsHeaders, urlencoded };
