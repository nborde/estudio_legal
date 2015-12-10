-- DROP DATABASE d1c9jmonqhru2t;

CREATE DATABASE d1c9jmonqhru2t


-- Table: user_login

-- DROP TABLE user_login;

CREATE TABLE user_login
(
  user_id serial NOT NULL,
  user_email character varying(50) NOT NULL,
  user_password character varying(100) NOT NULL,
  user_join_date timestamp with time zone DEFAULT now(),
  CONSTRAINT user_login_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_login_user_email_key UNIQUE (user_email)
)