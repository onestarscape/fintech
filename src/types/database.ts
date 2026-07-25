// NOTE: Once your Supabase project is live, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
// This hand-written version keeps local dev/type-checking working until then.

export type UserRole = "customer" | "employee" | "admin";
export type PartnerType = "bank" | "nbfc" | "insurer" | "other";
export type LeadStatus = "new" | "contacted" | "converted" | "dropped";
export type ApplicationStatus =
  | "in_progress"
  | "submitted"
  | "under_review"
  | "action_required"
  | "approved"
  | "rejected"
  | "disbursed"
  | "cancelled";

export interface FormFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  required: boolean;
  options?: string[];
  step: number;
}

export interface RequiredDocumentDef {
  key: string;
  label: string;
  required: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          city: string | null;
          role: UserRole;
          avatar_url: string | null;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string | null;
          icon: string | null;
          category: string;
          display_order: number;
          is_active: boolean;
          form_schema: FormFieldDef[];
          required_documents: RequiredDocumentDef[];
          workflow_stages: string[];
          assigned_team: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          type: PartnerType;
          logo_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          city: string | null;
          requirement: string | null;
          status: LeadStatus;
          assigned_to: string | null;
          external_ref: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leads"]["Row"]> & {
          product_id: string;
          full_name: string;
          phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string | null;
          product_id: string;
          form_data: Record<string, unknown>;
          status: ApplicationStatus;
          current_stage: string | null;
          assigned_rm_id: string | null;
          external_ref: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["applications"]["Row"]> & {
          lead_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          application_id: string;
          doc_key: string;
          label: string;
          storage_path: string;
          verified: boolean;
          verified_by: string | null;
          uploaded_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          application_id: string;
          doc_key: string;
          label: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [];
      };
      status_history: {
        Row: {
          id: string;
          application_id: string;
          status: ApplicationStatus;
          stage: string | null;
          note: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["status_history"]["Row"]> & {
          application_id: string;
          status: ApplicationStatus;
        };
        Update: Partial<Database["public"]["Tables"]["status_history"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string | null;
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          application_id: string;
          sender_id: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          application_id: string;
          sender_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      follow_ups: {
        Row: {
          id: string;
          lead_id: string | null;
          application_id: string | null;
          assigned_to: string | null;
          note: string;
          due_at: string | null;
          is_done: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["follow_ups"]["Row"]> & {
          note: string;
        };
        Update: Partial<Database["public"]["Tables"]["follow_ups"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      partner_type: PartnerType;
      lead_status: LeadStatus;
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
