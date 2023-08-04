CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE species_conn (
  conn_id BIGSERIAL PRIMARY KEY,
  formula TEXT,
  conn_smiles TEXT,
  conn_inchi TEXT,
  conn_inchi_key CHAR(27) UNIQUE,
  conn_amchi TEXT,
  conn_amchi_key CHAR(27) UNIQUE
);

CREATE TABLE species_estate (
  estate_id BIGSERIAL PRIMARY KEY,
  spin_mult SMALLINT,
  conn_id BIGINT REFERENCES species_conn(conn_id)
);

CREATE TABLE species (
  id BIGSERIAL PRIMARY KEY,
  geometry TEXT,
  smiles TEXT,
  inchi TEXT,
  amchi TEXT,
  amchi_key CHAR(27) UNIQUE,
  estate_id BIGINT REFERENCES species_estate(estate_id)
);
