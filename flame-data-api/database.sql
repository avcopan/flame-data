CREATE DATABASE flamedata;
\c flamedata;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  admin BOOLEAN DEFAULT FALSE NOT NULL
);