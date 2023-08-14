/* eslint-disable camelcase */
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb',
});

// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = (email) => pool
  .query('SELECT * FROM users WHERE email = $1', [email])
  .then((result) => result.rows[0] || null)
  .catch((err) => {
    throw err;
  });

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = (id) => pool
  .query('SELECT * FROM users WHERE id = $1', [id])
  .then((result) => result.rows[0] || null)
  .catch((err) => {
    throw err;
  });

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = (user) => new Promise((resolve, reject) => {
  const { name, email, password } = user;

  const queryText = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

  const values = [name, email, password];

  pool.query(queryText, values)
    .then((result) => {
      resolve(result.rows[0]);
    })
    .catch((error) => {
      reject(error);
    });
});

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guestId The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = (guestId, limit = 5) => {
  const queryString = `
    SELECT 
      reservations.*,
      properties.*
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1
    LIMIT $2; 
  `;

  const values = [guestId, limit];

  return pool
    .query(queryString, values)
    .then((result) => result.rows || null)
    .catch((err) => {
      throw err;
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];

  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) AS average_rating 
    FROM properties
    JOIN property_reviews ON property_id = properties.id
  `;

  const conditions = [];

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    conditions.push(`city LIKE $${queryParams.length}`);
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    conditions.push(`owner_id = $${queryParams.length}`);
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night, options.maximum_price_per_night);
    conditions.push(`cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    conditions.push(`property_reviews.rating >= $${queryParams.length}`);
  }

  if (conditions.length) {
    queryString += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}
  `;

  return pool.query(queryString, queryParams).then((res) => res.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */

const addProperty = function (property) {
  return new Promise((resolve, reject) => {
    const {
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms,
    } = property;

    const queryText = `
      INSERT INTO 
        properties (
          owner_id,
          title,
          description, 
          thumbnail_photo_url,
          cover_photo_url,
          cost_per_night,
          street,
          city,
          province,
          post_code,
          country,
          parking_spaces,
          number_of_bathrooms,
          number_of_bedrooms
        )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
    `;

    const values = [
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms,
    ];

    pool.query(queryText, values)
      .then((result) => {
        resolve(result.rows[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
