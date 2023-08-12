const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      return result.rows[0] || null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

// const getUserWithEmail = function (email) {
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user.email.toLowerCase() === email.toLowerCase()) {
//       resolvedUser = user;
//     }
//   }
//   return Promise.resolve(resolvedUser);
// };

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function (id) {
//   return pool
//     .query(`SELECT * FROM users WHERE id = $1`, [id])
//     .then((result) => {
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     })
// };

const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      return result.rows[0] || null;
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    })
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser = function (user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// };

const addUser = function (user) {
  return new Promise((resolve, reject) => {
    const {name, email, password} = user;

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
      .catch(error => {
        console.error("Error inserting user: ", error);
        reject(error);
      });
  });
};


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 5) {
  const queryString = `
    SELECT 
      reservations.*,
      properties.*
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1
    LIMIT $2; 
  `;

  const values = [guest_id, limit];  
  
  return pool
    .query(queryString, values)
    .then((result) => {
      console.log(result.rows);
      return result.rows || null;
    })
    .catch((err) => {
      console.error(err.message);
      // Consider adding additional error handling here
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  let queryParams = [];

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
    conditions.push(`owner_id = $${queryParams.length}`)
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night, options.maximum_price_per_night);
    conditions.push(`cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    conditions.push(`property_reviews.rating >= $${queryParams.length}`)
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

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams).then((res) => res.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
// const addProperty = function (property) {
//   const propertyId = Object.keys(properties).length + 1;
//   property.id = propertyId;
//   properties[propertyId] = property;
//   return Promise.resolve(property);
// };

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
      number_of_bedrooms
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
      number_of_bedrooms
    ];

    pool.query(queryText, values) 
      .then((result) => {
        resolve(result.rows[0]);
      })
      .catch(error => {
        console.error("Error inserting property: ", error);
        reject(error);
      });
  });
}

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
