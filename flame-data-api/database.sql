CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- -- Restart command:
-- DROP TABLE species_connectivity, species_estate, species_stereo;

CREATE TABLE species_connectivity (
  conn_id BIGSERIAL PRIMARY KEY,
  formula TEXT,
  svg_string TEXT,
  conn_smiles TEXT,
  conn_inchi TEXT,
  conn_inchi_hash CHAR(14) UNIQUE,
  conn_amchi TEXT,
  conn_amchi_hash CHAR(14) UNIQUE
);

CREATE TABLE species_estate (
  estate_id BIGSERIAL PRIMARY KEY,
  spin_mult SMALLINT,
  conn_id BIGINT
    REFERENCES species_connectivity(conn_id)
    ON DELETE CASCADE
);

CREATE TABLE species_stereo (
  id BIGSERIAL PRIMARY KEY,
  geometry TEXT,
  smiles TEXT,
  inchi TEXT,
  amchi TEXT,
  amchi_key CHAR(27) UNIQUE,
  estate_id BIGINT
    REFERENCES species_estate(estate_id)
    ON DELETE CASCADE
);
