CREATE TABLE TABLE IF NOT EXISTS gifComments (
  "commentId" SERIAL PRIMARY KEY,
  "comment" VARCHAR(255) NOT NULL,
  "userId" SERIAL REFERENCES users ("userId"),
  "gifId" SERIAL REFERENCES gifs ("gifId"),
  "flag" BOOLEAN NOT NULL DEFAULT false
);