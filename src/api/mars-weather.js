const express = require('express');
const axios = require('axios');

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// doing function to limit the number of time a user can send a request for api.

const limiter = rateLimit({
  windowMs: 25 * 1000, // 15 minutes
  max: 2, // limit each IP to 100 requests per windowMs
});

// making function that will slowdown a request api when user gets to send the first , after that,
// after that if they try a second time, it will slow down the process

const speedLimiter = slowDown({
  windowMs: 25 * 1000, // 15 minutes
  delayAfter: 1, // allow 1 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

//  apply to all requests
// app.use(limiter);

const router = express.Router();

const baseUrl = 'https://api.nasa.gov/insight_weather/?';

// lets create a cache to reduce the number of request of api user may wanna request
// creating two variables cachedData and cacheTime

let cachedData;
let cacheTime;

// creating my own api key

const apiKeys = new Map();
apiKeys.set('123456', true);

router.get(
  '/',
  limiter,
  speedLimiter,
  (req, res, next) => {
    // requiring users to use this header when they need my api key
    const ricoApiKey = req.get('Rico-Api-Key');
    // now saying that if the user got this api key then permit them else throw error.
    if (apiKeys.has(ricoApiKey)) {
      next();
    } else {
      const error = new Error('Invalid API KEY my friend');
      next(error);
    }
  },
  async (req, res, next) => {
    //  doing logic here saying that if the cacheTime is greater than
    // current date then we are gonna limit their request to 25 secs
    if (cacheTime && cacheTime > Date.now() - 25 * 1000) {
      return res.json(cachedData);
    }
    try {
      const params = new URLSearchParams({
        api_key: process.env.RICO_NASA_API_KEY,
        feedtype: 'json',
        version: '1.0',
      });
      // make request to nasa data api

      const { data } = await axios.get(`${baseUrl}${params}`);
      cachedData = data;
      cacheTime = Date.now();
      data.cacheTime = cacheTime;
      // response from nasa data api
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
