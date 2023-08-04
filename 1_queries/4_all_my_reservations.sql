SELECT 
  reservations.id,
  properties.title,
  properties.cost_per_night,
  reservations.start_date,
  avg(property_reviews.rating) as average_rating

FROM users


JOIN reservations ON reservations.guest_id = users.id
JOIN properties ON properties.id = property_id
JOIN property_reviews ON property_reviews.guest_id = users.id

WHERE users.id = 1
GROUP BY properties.title, reservations.id, properties.cost_per_night
ORDER BY reservations.start_date
LIMIT 10;
