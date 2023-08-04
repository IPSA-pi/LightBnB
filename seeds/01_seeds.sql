INSERT INTO users (name, email, password) VALUES ('John Doe', 'john.doe@example.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Jane Smith', 'jane.smith@example.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Robert Johnson', 'robert.johnson@example.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u');

INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, postal_code, active) VALUES
(1, 'Seaside Villa', 'description', 'http://example.com/thumbnail1.jpg', 'http://example.com/cover1.jpg', 200, 2, 3, 3, 'USA', '123 Ocean View', 'Los Angeles', 'California', '90001', TRUE),
(2, 'Country Cottage', 'description', 'http://example.com/thumbnail2.jpg', 'http://example.com/cover2.jpg', 150, 1, 2, 2, 'Canada', '456 Forest Lane', 'Vancouver', 'British Columbia', 'V5K0A1', FALSE),
(2, 'City Apartment', 'description', 'http://example.com/thumbnail3.jpg', 'http://example.com/cover3.jpg', 100, 1, 1, 1, 'United Kingdom', '789 High Street', 'London', 'Greater London', 'SW1A 1AA', TRUE);

INSERT INTO reservations (start_date, end_date, property_id, guest_id) VALUES 
('2018-09-11', '2018-09-26', 2, 3),
('2019-01-04', '2019-02-01', 2, 2),
('2023-10-01', '2023-10-14', 1, 3);

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message) VALUES
(3, 2, 1, 3, 'message'),
(2, 1, 3, 3, 'message'),
(1, 2, 2, 3, 'message');