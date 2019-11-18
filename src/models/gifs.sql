CREATE TABLE IF NOT EXISTS gifs (
  "gifId" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "imageUrl" VARCHAR(255) NOT NULL,
  "public_url" VARCHAR(255) NOT NULL,
  "userId" SERIAL REFERENCES users ("userId"),
  "createdOn" TIMESTAMP NOT NULL DEFAULT current_timestamp,
  "flag" VARCHAR(255) NOT NULL
);