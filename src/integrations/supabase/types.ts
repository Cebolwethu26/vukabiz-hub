export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          cipc_number: string | null
          city: string | null
          created_at: string
          employees: number
          id: string
          is_registered: boolean
          name: string
          owner_id: string
          province: string | null
          route: Database["public"]["Enums"]["pathway"]
          sars_tax_pin: string | null
          sector: string | null
          stage: Database["public"]["Enums"]["business_stage"]
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          cipc_number?: string | null
          city?: string | null
          created_at?: string
          employees?: number
          id?: string
          is_registered?: boolean
          name: string
          owner_id: string
          province?: string | null
          route?: Database["public"]["Enums"]["pathway"]
          sars_tax_pin?: string | null
          sector?: string | null
          stage?: Database["public"]["Enums"]["business_stage"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          cipc_number?: string | null
          city?: string | null
          created_at?: string
          employees?: number
          id?: string
          is_registered?: boolean
          name?: string
          owner_id?: string
          province?: string | null
          route?: Database["public"]["Enums"]["pathway"]
          sars_tax_pin?: string | null
          sector?: string | null
          stage?: Database["public"]["Enums"]["business_stage"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      fund_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          occurred_at: string
          recipient_business: string | null
          reference: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          vendor_name: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          recipient_business?: string | null
          reference?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          occurred_at?: string
          recipient_business?: string | null
          reference?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          vendor_name?: string | null
        }
        Relationships: []
      }
      grant_applications: {
        Row: {
          amount_approved: number | null
          amount_requested: number
          applicant_id: string
          business_id: string
          created_at: string
          id: string
          line_items: Json
          purpose: string | null
          status: Database["public"]["Enums"]["application_status"]
          title: string
          updated_at: string
          vendor_category: string | null
          vendor_name: string
        }
        Insert: {
          amount_approved?: number | null
          amount_requested?: number
          applicant_id: string
          business_id: string
          created_at?: string
          id?: string
          line_items?: Json
          purpose?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title: string
          updated_at?: string
          vendor_category?: string | null
          vendor_name: string
        }
        Update: {
          amount_approved?: number | null
          amount_requested?: number
          applicant_id?: string
          business_id?: string
          created_at?: string
          id?: string
          line_items?: Json
          purpose?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title?: string
          updated_at?: string
          vendor_category?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_applications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trustee_approvals: {
        Row: {
          application_id: string
          approved: boolean
          created_at: string
          id: string
          notes: string | null
          trustee_id: string
          trustee_name: string | null
        }
        Insert: {
          application_id: string
          approved?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          trustee_id: string
          trustee_name?: string | null
        }
        Update: {
          application_id?: string
          approved?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          trustee_id?: string
          trustee_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trustee_approvals_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "grant_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "member" | "mentor" | "trustee" | "admin"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "disbursed"
      business_stage: "idea" | "early" | "growth" | "established"
      pathway: "upskilling" | "grant_ready"
      transaction_type: "contribution" | "disbursement" | "overhead"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["member", "mentor", "trustee", "admin"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
      ],
      business_stage: ["idea", "early", "growth", "established"],
      pathway: ["upskilling", "grant_ready"],
      transaction_type: ["contribution", "disbursement", "overhead"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
