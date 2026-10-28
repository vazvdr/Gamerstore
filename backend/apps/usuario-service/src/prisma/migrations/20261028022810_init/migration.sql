-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
