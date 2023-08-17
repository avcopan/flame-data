-- -- Restart command:
-- DROP TABLE IF EXISTS users, collections, species_connectivity, species_estate, species, species_collections;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  name TEXT,
  user_id INT
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE species_connectivity (
  conn_id BIGSERIAL PRIMARY KEY, -- Change this to `id`
  formula TEXT,
  svg_string TEXT,
  conn_smiles TEXT,
  conn_inchi TEXT,
  conn_inchi_hash CHAR(14) UNIQUE,
  conn_amchi TEXT,
  conn_amchi_hash CHAR(14) UNIQUE
);

CREATE TABLE species_estate (
  estate_id BIGSERIAL PRIMARY KEY, -- Change this to `id`
  spin_mult SMALLINT,
  conn_id BIGINT
    REFERENCES species_connectivity(conn_id)
    ON DELETE CASCADE
);

CREATE TABLE species (
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

CREATE TABLE collections_species (
  id BIGSERIAL PRIMARY KEY,
  coll_id INT
    REFERENCES collections(id)
    ON DELETE CASCADE,
  species_id BIGINT
    REFERENCES species(id)
    ON DELETE CASCADE
);
