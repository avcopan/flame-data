-- Create a database called `test`
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE,
  password VARCHAR(100)
);
