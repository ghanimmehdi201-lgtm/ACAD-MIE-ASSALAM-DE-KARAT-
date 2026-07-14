import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

// Association Settings
export const associationSettings = pgTable("association_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  nameAr: text("name_ar").notNull().default(""),
  logo: text("logo"),
  address: text("address").default(""),
  addressAr: text("address_ar").default(""),
  phone: text("phone").default(""),
  email: text("email").default(""),
  legalRegistrationNumber: text("legal_registration_number").default(""),
  taxNumber: text("tax_number").default(""),
  bankName: text("bank_name").default(""),
  bankAccount: text("bank_account").default(""),
  iban: text("iban").default(""),
  presidentName: text("president_name").default(""),
  presidentNameAr: text("president_name_ar").default(""),
  treasurerName: text("treasurer_name").default(""),
  treasurerNameAr: text("treasurer_name_ar").default(""),
  secretaryName: text("secretary_name").default(""),
  secretaryNameAr: text("secretary_name_ar").default(""),
  currency: text("currency").default("MAD"),
  // Numbering settings
  numberingSystem: text("numbering_system").default("french"), // french | arabic | custom
  receiptVoucherPrefix: text("receipt_voucher_prefix").default("BR"),
  paymentVoucherPrefix: text("payment_voucher_prefix").default("BC"),
  receiptPrefix: text("receipt_prefix").default("R"),
  numberFormat: text("number_format").default("0001/YYYY"), // 0001/YYYY | 001/YYYY | 1/YYYY
  numberingMode: text("numbering_mode").default("season"), // season | continuous
  // Language settings
  interfaceLanguage: text("interface_language").default("fr"), // fr | ar
  documentLanguage: text("document_language").default("bilingual"), // fr | ar | bilingual
  registerLanguage: text("register_language").default("bilingual"), // fr | ar | bilingual
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Seasons
export const financialSeasons = pgTable("financial_seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0"),
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).default("0"),
  isClosed: boolean("is_closed").default(false),
  isActive: boolean("is_active").default(true),
  // Counters for this season
  receiptVoucherCounter: integer("receipt_voucher_counter").default(0),
  paymentVoucherCounter: integer("payment_voucher_counter").default(0),
  receiptCounter: integer("receipt_counter").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Receipt Vouchers (Bons de Recette)
export const receiptVouchers = pgTable("receipt_vouchers", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => financialSeasons.id),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  date: text("date").notNull(),
  receivedFrom: text("received_from").notNull().default(""),
  receivedFromAr: text("received_from_ar").default(""),
  nationalId: text("national_id").default(""),
  position: text("position").default(""),
  positionAr: text("position_ar").default(""),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0"),
  amountInWords: text("amount_in_words").default(""),
  amountInWordsAr: text("amount_in_words_ar").default(""),
  reason: text("reason").default(""),
  reasonAr: text("reason_ar").default(""),
  paymentMethod: text("payment_method").default("cash"), // cash | cheque | transfer | deposit
  chequeNumber: text("cheque_number").default(""),
  attachmentTypes: jsonb("attachment_types").default([]),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Vouchers (Bons de Caisse)
export const paymentVouchers = pgTable("payment_vouchers", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => financialSeasons.id),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  date: text("date").notNull(),
  paidTo: text("paid_to").notNull().default(""),
  paidToAr: text("paid_to_ar").default(""),
  nationalId: text("national_id").default(""),
  position: text("position").default(""),
  positionAr: text("position_ar").default(""),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0"),
  amountInWords: text("amount_in_words").default(""),
  amountInWordsAr: text("amount_in_words_ar").default(""),
  purpose: text("purpose").default(""),
  purposeAr: text("purpose_ar").default(""),
  paymentMethod: text("payment_method").default("cash"), // cash | cheque | transfer
  chequeNumber: text("cheque_number").default(""),
  attachmentTypes: jsonb("attachment_types").default([]),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Receipts (Reçus / وصولات)
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => financialSeasons.id),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  date: text("date").notNull(),
  fullName: text("full_name").notNull().default(""),
  fullNameAr: text("full_name_ar").default(""),
  nationalId: text("national_id").default(""),
  address: text("address").default(""),
  addressAr: text("address_ar").default(""),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0"),
  amountInWords: text("amount_in_words").default(""),
  amountInWordsAr: text("amount_in_words_ar").default(""),
  reason: text("reason").default(""),
  reasonAr: text("reason_ar").default(""),
  paymentMethod: text("payment_method").default("cash"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  documentType: text("document_type").notNull(), // receipt_voucher | payment_voucher | receipt
  documentId: integer("document_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").default(0),
  fileData: text("file_data"), // base64 encoded
  attachmentType: text("attachment_type").default("other"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cash Book entries (auto-generated)
export const cashBook = pgTable("cash_book", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => financialSeasons.id),
  date: text("date").notNull(),
  referenceNumber: varchar("reference_number", { length: 50 }).notNull(),
  description: text("description").default(""),
  descriptionAr: text("description_ar").default(""),
  income: decimal("income", { precision: 15, scale: 2 }).default("0"),
  expense: decimal("expense", { precision: 15, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  documentType: text("document_type").notNull(), // receipt_voucher | payment_voucher
  documentId: integer("document_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AssociationSettings = typeof associationSettings.$inferSelect;
export type InsertAssociationSettings = typeof associationSettings.$inferInsert;
export type FinancialSeason = typeof financialSeasons.$inferSelect;
export type InsertFinancialSeason = typeof financialSeasons.$inferInsert;
export type ReceiptVoucher = typeof receiptVouchers.$inferSelect;
export type InsertReceiptVoucher = typeof receiptVouchers.$inferInsert;
export type PaymentVoucher = typeof paymentVouchers.$inferSelect;
export type InsertPaymentVoucher = typeof paymentVouchers.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type CashBookEntry = typeof cashBook.$inferSelect;
