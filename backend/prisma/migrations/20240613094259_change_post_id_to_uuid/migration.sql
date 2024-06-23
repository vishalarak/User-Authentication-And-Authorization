/*
  Warnings:

  - The primary key for the `user_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `post_name` on the `user_posts` table. All the data in the column will be lost.
  - Added the required column `post_title` to the `user_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_posts" DROP CONSTRAINT "user_posts_pkey",
DROP COLUMN "post_name",
ADD COLUMN     "post_image" TEXT,
ADD COLUMN     "post_title" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_posts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_posts_id_seq";
