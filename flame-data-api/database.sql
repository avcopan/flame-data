-- USER TABLES

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(345) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- SPECIES TABLES

CREATE TABLE species_connectivity (
  id BIGSERIAL PRIMARY KEY,
  formula TEXT,
  svg_string TEXT,
  conn_smiles TEXT,
  conn_inchi TEXT,
  conn_inchi_hash CHAR(14) UNIQUE,
  conn_amchi TEXT,
  conn_amchi_hash CHAR(14) UNIQUE
);

CREATE TABLE species_estate (
  id BIGSERIAL PRIMARY KEY,
  spin_mult SMALLINT,
  conn_id BIGINT
    REFERENCES species_connectivity(id)
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
    REFERENCES species_estate(id)
    ON DELETE CASCADE
);

-- REACTION TABLES

-- Restart command:
-- DROP TABLE IF EXISTS reaction_connectivity, reaction, reaction_estate, reaction_ts, reaction_reactants, reaction_products, collections_reactions;

-- This table contains duplicate information that could be recreated using a JOIN It is
-- mainly for searching purposes
CREATE TABLE reaction_connectivity (
  id BIGSERIAL PRIMARY KEY,
  formula TEXT,
  conn_smiles TEXT,
  r_svg_string TEXT,
  p_svg_string TEXT,
  r_conn_inchi TEXT,
  p_conn_inchi TEXT,
  r_conn_inchi_hash CHAR(14),
  p_conn_inchi_hash CHAR(14),
  r_conn_amchi TEXT,
  p_conn_amchi TEXT,
  r_conn_amchi_hash CHAR(14),
  p_conn_amchi_hash CHAR(14),
  r_formulas TEXT[],
  p_formulas TEXT[],
  r_conn_inchis TEXT[],
  p_conn_inchis TEXT[],
  r_conn_inchi_hashes CHAR(14)[],
  p_conn_inchi_hashes CHAR(14)[],
  r_conn_amchis TEXT[],
  p_conn_amchis TEXT[],
  r_conn_amchi_hashes CHAR(14)[],
  p_conn_amchi_hashes CHAR(14)[],
  r_conn_ids INTEGER[],  -- Unofficially references species_connectivity(id)
  p_conn_ids INTEGER[],  -- Unofficially references species_connectivity(id)
  UNIQUE(r_conn_inchi_hash, p_conn_inchi_hash),
  UNIQUE(r_conn_amchi_hash, p_conn_amchi_hash)
);

CREATE TABLE reaction (
  id BIGSERIAL PRIMARY KEY,
  smiles TEXT,
  r_amchi TEXT,
  p_amchi TEXT,
  r_amchi_key CHAR(27),
  p_amchi_key CHAR(27),
  r_inchis TEXT[],  -- These can be obtained from a join, but it's useful to keep them sorted
  p_inchis TEXT[],
  r_amchis TEXT[],
  p_amchis TEXT[],
  r_amchi_keys CHAR(27)[],
  p_amchi_keys CHAR(27)[],
  conn_id BIGINT
    REFERENCES reaction_connectivity(id)
    ON DELETE CASCADE,
  UNIQUE(r_amchi_key, p_amchi_key)
);

CREATE TABLE reaction_estate (
  id BIGSERIAL PRIMARY KEY,
  spin_mult SMALLINT,
  reaction_id BIGINT
    REFERENCES reaction(id)
    ON DELETE CASCADE
);

CREATE TABLE reaction_ts (
  id BIGSERIAL PRIMARY KEY,
  geometry TEXT,
  class TEXT,
  amchi TEXT,
  amchi_key CHAR(27) UNIQUE,
  estate_id BIGINT
    REFERENCES reaction_estate(id)
    ON DELETE CASCADE
);

-- REAGENTS TABLES

CREATE TABLE reaction_reactants (
  reaction_id BIGINT
    REFERENCES reaction(id)
    ON DELETE CASCADE,
  species_id BIGINT
    REFERENCES species(id)
    ON DELETE CASCADE,
  PRIMARY KEY(reaction_id, species_id)
);

CREATE TABLE reaction_products (
  reaction_id BIGINT
    REFERENCES reaction(id)
    ON DELETE CASCADE,
  species_id BIGINT
    REFERENCES species(id)
    ON DELETE CASCADE,
  PRIMARY KEY(reaction_id, species_id)
);

-- COLLECTION TABLES

-- Rename these to "collection" for consistency
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  name TEXT,
  user_id INT
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE collections_species (
  coll_id INT
    REFERENCES collections(id)
    ON DELETE CASCADE,
  species_id BIGINT
    REFERENCES species(id)
    ON DELETE CASCADE,
  PRIMARY KEY(coll_id, species_id)
);

CREATE TABLE collections_reactions (
  coll_id INT
    REFERENCES collections(id)
    ON DELETE CASCADE,
  reaction_id BIGINT
    REFERENCES reaction(id)
    ON DELETE CASCADE,
  PRIMARY KEY(coll_id, reaction_id)
);
