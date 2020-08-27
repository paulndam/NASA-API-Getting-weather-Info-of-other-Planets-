const express = require('express');
const axios = require('axios');

const router = express.Router();

const baseUrl = 'https: //api.nasa.gov/insight_weather/?';

router.get('/', async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      api_key: process.env.RICO_NASA_API_KEY,
      feedtype: 'json',
      ver: '1.0',
    });
    // step 1;- make request to nasa api
    const { data } = await axios.get(`${baseUrl}${params}`);
    // step 2;- response from the nasa data api
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
