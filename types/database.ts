/**
 * Database types for Loan Market.
 *
 * Hand-written to match the Stage 2 Supabase schema for the tables the app
 * currently reads/writes (profiles, borrower_profiles, lender_profiles). Other
 * tables exist in the database but are added here as the app starts using them.
 * Eventually this can be replaced by generated types:
 *   npx supabase gen types typescript --project-id <ref> > types/database.ts
 */

/** Roles a person can hold in the marketplace. */
export type UserRole = "borrower" | "lender" | "admin";

/** Loan categories used to organise borrower requests & lender listings. */
export type LoanCategory =
  | "mortgage" | "refinance" | "personal" | "auto"
  | "business" | "debt_consolidation" | "home_equity" | "other";

/** Whether a loan is backed by collateral (matches DB enum). */
export type SecuredStatus = "secured" | "unsecured" | "either";

/** Listing lifecycle status for loan requests & lender listings (matches DB enum). */
export type ListingStatus = "active" | "delisted" | "removed_by_admin";

/** Status of a lender's manual verification by an admin (matches DB enum). */
export type LenderVerificationStatus =
  | "pending_verification" | "verified" | "rejected" | "suspended";

/**
 * Outcome of the backend licence/registration check for licensed lenders
 * (matches DB enum). Private lenders are `not_applicable`.
 */
export type LicenceVerificationStatus =
  | "not_applicable" | "pending" | "verified" | "not_found" | "suspended";

/** Canadian province / territory codes (matches DB enum). */
export type Province =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT"
  | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

/** Lender categories (matches DB enum). */
export type LenderType =
  | "mortgage_broker" | "mortgage_agent" | "private_lender"
  | "financing_company" | "bank" | "credit_union" | "other";

/** Outcome of a contact request lifecycle (matches DB enum). */
export type ContactRequestStatus =
  | "pending"
  | "approved_pending_payment"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

/** Direction of a contact request (matches DB enum). */
export type ContactDirection = "lender_to_borrower" | "borrower_to_lender";

/** Conversation lifecycle status (matches DB enum). */
export type ConversationStatus = "active" | "closed";

/** Report lifecycle status (matches DB enum). */
export type ReportStatus = "open" | "reviewing" | "closed";

/** Allowed report reasons (stored as text; validated against this union). */
export type ReportReason =
  | "spam"
  | "scam_fake_lender"
  | "upfront_fee_request"
  | "misleading_loan_claim"
  | "harassment"
  | "asking_sensitive_documents"
  | "asking_sin_bank_password"
  | "abusive_language"
  | "suspicious_behaviour"
  | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      borrower_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          city: string | null;
          province: Province | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          city?: string | null;
          province?: Province | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          city?: string | null;
          province?: Province | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lender_profiles: {
        Row: {
          id: string;
          user_id: string;
          legal_name: string | null;
          business_name: string | null;
          business_email: string | null;
          phone: string | null;
          website_or_social: string | null;
          business_address_or_service_area: string | null;
          lender_type: LenderType | null;
          licence_number: string | null;
          brokerage_or_company_name: string | null;
          operating_provinces: Province[];
          verification_status: LenderVerificationStatus;
          verification_notes: string | null;
          is_private_lender: boolean;
          incorporated_over_1_year: boolean | null;
          accepts_no_upfront_fee_rule: boolean;
          accepts_interest_compliance: boolean;
          accepts_platform_rules: boolean;
          licence_verification_status: LicenceVerificationStatus;
          licence_checked_at: string | null;
          licence_check_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          legal_name?: string | null;
          business_name?: string | null;
          business_email?: string | null;
          phone?: string | null;
          website_or_social?: string | null;
          business_address_or_service_area?: string | null;
          lender_type?: LenderType | null;
          licence_number?: string | null;
          brokerage_or_company_name?: string | null;
          operating_provinces?: Province[];
          verification_status?: LenderVerificationStatus;
          verification_notes?: string | null;
          is_private_lender?: boolean;
          incorporated_over_1_year?: boolean | null;
          accepts_no_upfront_fee_rule?: boolean;
          accepts_interest_compliance?: boolean;
          accepts_platform_rules?: boolean;
          licence_verification_status?: LicenceVerificationStatus;
          licence_checked_at?: string | null;
          licence_check_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          legal_name?: string | null;
          business_name?: string | null;
          business_email?: string | null;
          phone?: string | null;
          website_or_social?: string | null;
          business_address_or_service_area?: string | null;
          lender_type?: LenderType | null;
          licence_number?: string | null;
          brokerage_or_company_name?: string | null;
          operating_provinces?: Province[];
          verification_status?: LenderVerificationStatus;
          verification_notes?: string | null;
          is_private_lender?: boolean;
          incorporated_over_1_year?: boolean | null;
          accepts_no_upfront_fee_rule?: boolean;
          accepts_interest_compliance?: boolean;
          accepts_platform_rules?: boolean;
          licence_verification_status?: LicenceVerificationStatus;
          licence_checked_at?: string | null;
          licence_check_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_requests: {
        Row: {
          id: string;
          borrower_id: string;
          loan_category: LoanCategory;
          province: Province | null;
          city: string | null;
          amount_range: string | null;
          purpose_category: string | null;
          secured_status: SecuredStatus | null;
          credit_score_range: string | null;
          income_range: string | null;
          employment_type: string | null;
          loan_term_range: string | null;
          expected_interest_range: string | null;
          borrower_note: string | null;
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          borrower_id: string;
          loan_category: LoanCategory;
          province?: Province | null;
          city?: string | null;
          amount_range?: string | null;
          purpose_category?: string | null;
          secured_status?: SecuredStatus | null;
          credit_score_range?: string | null;
          income_range?: string | null;
          employment_type?: string | null;
          loan_term_range?: string | null;
          expected_interest_range?: string | null;
          borrower_note?: string | null;
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          borrower_id?: string;
          loan_category?: LoanCategory;
          province?: Province | null;
          city?: string | null;
          amount_range?: string | null;
          purpose_category?: string | null;
          secured_status?: SecuredStatus | null;
          credit_score_range?: string | null;
          income_range?: string | null;
          employment_type?: string | null;
          loan_term_range?: string | null;
          expected_interest_range?: string | null;
          borrower_note?: string | null;
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lender_listings: {
        Row: {
          id: string;
          lender_id: string;
          product_title: string;
          loan_category: LoanCategory;
          service_area: string | null;
          amount_range: string | null;
          term_range: string | null;
          rate_range: string | null;
          secured_status: SecuredStatus | null;
          product_description: string | null;
          important_conditions: string | null;
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lender_id: string;
          product_title: string;
          loan_category: LoanCategory;
          service_area?: string | null;
          amount_range?: string | null;
          term_range?: string | null;
          rate_range?: string | null;
          secured_status?: SecuredStatus | null;
          product_description?: string | null;
          important_conditions?: string | null;
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lender_id?: string;
          product_title?: string;
          loan_category?: LoanCategory;
          service_area?: string | null;
          amount_range?: string | null;
          term_range?: string | null;
          rate_range?: string | null;
          secured_status?: SecuredStatus | null;
          product_description?: string | null;
          important_conditions?: string | null;
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_notes: {
        Row: {
          id: string;
          admin_user_id: string;
          related_user_id: string | null;
          related_lender_profile_id: string | null;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          related_user_id?: string | null;
          related_lender_profile_id?: string | null;
          note: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          related_user_id?: string | null;
          related_lender_profile_id?: string | null;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: string;
          direction: ContactDirection;
          requester_user_id: string;
          recipient_user_id: string;
          borrower_id: string;
          lender_id: string;
          loan_request_id: string | null;
          lender_listing_id: string | null;
          status: ContactRequestStatus;
          payment_required: boolean;
          payment_status: string;
          amount_cents: number;
          expires_at: string | null;
          requested_at: string;
          approved_at: string | null;
          rejected_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          contact_request_id: string;
          borrower_id: string;
          lender_id: string;
          status: ConversationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_user_id: string;
          body: string;
          created_at: string;
          // Set automatically by the set_message_expiry trigger (6mo retention).
          expires_at: string | null;
        };
        // We insert messages directly (RLS msg_insert enforces participant +
        // active conversation + not blocked). expires_at is set by trigger.
        Insert: {
          id?: string;
          conversation_id: string;
          sender_user_id: string;
          body: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_user_id: string;
          reported_user_id: string;
          related_conversation_id: string | null;
          related_loan_request_id: string | null;
          related_lender_listing_id: string | null;
          reason: string;
          description: string | null;
          status: ReportStatus;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        // Reports are created via the submit_report RPC, not direct inserts.
        Insert: never;
        // Admins update status / admin_notes directly (rep_update RLS).
        Update: {
          status?: ReportStatus;
          admin_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          blocker_user_id: string;
          blocked_user_id: string;
          created_at: string;
        };
        // Blocks are created/removed via SECURITY DEFINER RPCs.
        Insert: never;
        Update: never;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          contact_request_id: string | null;
          payment_type: "listing_contact_fee";
          amount_cents: number;
          status: "pending" | "paid" | "failed" | "refunded";
          stripe_session_id: string | null;
          created_at: string;
        };
        // Payment rows are written server-side (service role / RPC), not by users.
        Insert: never;
        Update: never;
        Relationships: [];
      };
      credit_wallets: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        // Wallet rows change only via SECURITY DEFINER credit functions.
        Insert: never;
        Update: never;
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "purchase" | "spend" | "refund" | "grant";
          amount: number;
          balance_after: number;
          contact_request_id: string | null;
          stripe_session_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      request_loan_request_contact: {
        Args: { p_loan_request_id: string };
        Returns: string;
      };
      approve_contact_request: {
        Args: { p_request_id: string };
        Returns: ContactRequestStatus;
      };
      reject_contact_request: {
        Args: { p_request_id: string };
        Returns: ContactRequestStatus;
      };
      cancel_contact_request: {
        Args: { p_request_id: string };
        Returns: ContactRequestStatus;
      };
      request_listing_contact: {
        Args: { p_lender_listing_id: string };
        Returns: string;
      };
      submit_report: {
        Args: {
          p_reason: string;
          p_description?: string | null;
          p_loan_request_id?: string | null;
          p_lender_listing_id?: string | null;
          p_conversation_id?: string | null;
        };
        Returns: string;
      };
      block_in_conversation: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      unblock_in_conversation: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      i_blocked_partner: {
        Args: { p_conversation_id: string };
        Returns: boolean;
      };
      mark_contact_request_paid: {
        Args: { p_request_id: string; p_stripe_session_id?: string | null };
        Returns: ContactRequestStatus;
      };
      add_credits_for_purchase: {
        Args: { p_user: string; p_credits: number; p_stripe_session_id: string | null };
        Returns: number;
      };
      contact_credit_cost: {
        Args: { p_category: LoanCategory };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      loan_category: LoanCategory;
      lender_verification_status: LenderVerificationStatus;
      province: Province;
      lender_type: LenderType;
      secured_status: SecuredStatus;
      listing_status: ListingStatus;
      licence_verification_status: LicenceVerificationStatus;
      contact_request_status: ContactRequestStatus;
      contact_direction: ContactDirection;
      conversation_status: ConversationStatus;
      report_status: ReportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
