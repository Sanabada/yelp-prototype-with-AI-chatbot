CREATE DATABASE yelp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'yelp_user'@'localhost' IDENTIFIED BY 'yelp_pass';
GRANT ALL PRIVILEGES ON yelp_db.* TO 'yelp_user'@'localhost';
FLUSH PRIVILEGES;