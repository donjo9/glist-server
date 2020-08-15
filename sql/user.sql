CREATE TABLE "users"
(
 "id"       text NOT NULL,
 "name"     text NOT NULL,
 "email"    text NOT NULL,
 "password" text NOT NULL,
 CONSTRAINT "PK_users" PRIMARY KEY ( "id" )
);

CREATE TABLE "lists"
(
 "id"      text NOT NULL,
 "name"    text NOT NULL,
 "user_id" text NOT NULL,
 CONSTRAINT "PK_lists" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_17" FOREIGN KEY ( "user_id" ) REFERENCES "users" ( "id" )
);

CREATE INDEX "fkIdx_17" ON "lists"
(
 "user_id"
);

CREATE TABLE "listitems"
(
 "id"       serial NOT NULL,
 "itemname" text NOT NULL,
 "list_id"  text NOT NULL,
 CONSTRAINT "PK_listitems" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_33" FOREIGN KEY ( "list_id" ) REFERENCES "lists" ( "id" )
);

CREATE INDEX "fkIdx_33" ON "listitems"
(
 "list_id"
);
