CREATE DATABASE voters;
CREATE USER 'voters'@'localhost' IDENTIFIED BY 'voters-pw';
GRANT ALL PRIVILEGES ON voters.* TO 'voters'@'localhost';
CREATE TABLE voters.voters (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(128) NOT NULL,
  vote_cast BIT NOT NULL);
