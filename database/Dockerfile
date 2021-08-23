FROM postgres

LABEL maintainer "Digitaal Vlaanderen "

COPY init_db.sql /docker-entrypoint-initdb.d/01-init_db.sql
COPY projection_status.sql /docker-entrypoint-initdb.d/02-projection_status.sql