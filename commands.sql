CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author TEXT,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES ('Michael Chan', 'https://reactpatterns.com/', 'React patterns', 7);
INSERT INTO blogs (author, url, title) VALUES ('Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', 'TDD harms architecture');