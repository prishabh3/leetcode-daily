LIMIT 1
)
UNION ALL
(
    SELECT m.title AS results
    FROM MovieRating r
    JOIN Movies m ON r.movie_id = m.movie_id
    WHERE r.created_at >= '2020-02-01' AND r.created_at <= '2020-02-29'
    GROUP BY m.movie_id, m.title
    ORDER BY AVG(r.rating) DESC, m.title ASC
    ORDER BY COUNT(r.movie_id) DESC, u.name ASC
    JOIN Users u ON r.user_id = u.user_id
    GROUP BY u.user_id, u.name
    SELECT u.name AS results
    FROM MovieRating r
(