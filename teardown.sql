DROP TABLE voters.voters;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'voters'@'localhost';
DROP USER 'voters'@'localhost';
DROP DATABASE voters;

