-- CreateTable
CREATE TABLE "landing_testimonials" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "company" TEXT,
    "author_ar" TEXT,
    "role_ar" TEXT,
    "quote_ar" TEXT,
    "company_ar" TEXT,
    "avatar" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "question_ar" TEXT,
    "answer_ar" TEXT,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content_en" JSONB NOT NULL,
    "content_ar" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_content" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_content_key_key" ON "landing_page_content"("key");

-- CreateIndex
CREATE UNIQUE INDEX "legal_content_type_key" ON "legal_content"("type");
