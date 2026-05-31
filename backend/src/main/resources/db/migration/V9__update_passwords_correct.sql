-- Update all users to have the correct bcrypt hash for "password"
UPDATE users SET password_hash = '$2a$12$pbI1iu4Kmz0SnJEAKyuO7OmYUeqJB5zu/hlQU8s/UPiitvuMH81XG';
