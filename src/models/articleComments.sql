CREATE TABLE TABLE IF NOT EXISTS articleComments (
  "commentId" SERIAL PRIMARY KEY,
  "comment" VARCHAR(255) NOT NULL,
  "userId" SERIAL REFERENCES users ("userId"),
  "articleId" SERIAL REFERENCES articles ("articleId"),
  "flag" BOOLEAN NOT NULL DEFAULT false
);