 CREATE TABLE `person` (
   `id` int NOT NULL AUTO_INCREMENT,
   `loginid` varchar(10) NOT NULL,
   `password` varchar(20) NOT NULL,
   `name` varchar(20) NOT NULL,
   `address` varchar(50) DEFAULT NULL,
   `tel` varchar(13) DEFAULT NULL,
   `birth` varchar(8) NOT NULL,
   `class` varchar(2) NOT NULL,
   `grade` varchar(2) NOT NULL,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
