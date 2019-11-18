CREATE TABLE IF NOT EXISTS articles (
  "articleId" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "article" TEXT NOT NULL,
  "userId" SERIAL REFERENCES users ("userId"),
  "createdOn" VARCHAR(255) NOT NULL,
  "flag" BOOLEAN NOT NULL DEFAULT false,
  "categoryId" VARCHAR(255) NOT NULL
);