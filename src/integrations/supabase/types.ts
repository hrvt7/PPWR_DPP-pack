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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      compliance_reports: {
        Row: {
          cost_savings: number | null
          created_at: string
          dpp_qr_url: string | null
          id: string
          integration_id: string | null
          is_ppwr_compliant: boolean | null
          order_date: string | null
          order_id: string | null
          order_number: string
          pdf_url: string | null
          platform: string | null
          ppwr_qr_url: string | null
          product_dimensions_height: number | null
          product_dimensions_length: number | null
          product_dimensions_width: number | null
          product_id: string | null
          product_name: string
          recommended_box_id: string | null
          recommended_box_name: string | null
          status: string | null
          user_id: string
          void_space_percentage: number | null
        }
        Insert: {
          cost_savings?: number | null
          created_at?: string
          dpp_qr_url?: string | null
          id?: string
          integration_id?: string | null
          is_ppwr_compliant?: boolean | null
          order_date?: string | null
          order_id?: string | null
          order_number: string
          pdf_url?: string | null
          platform?: string | null
          ppwr_qr_url?: string | null
          product_dimensions_height?: number | null
          product_dimensions_length?: number | null
          product_dimensions_width?: number | null
          product_id?: string | null
          product_name: string
          recommended_box_id?: string | null
          recommended_box_name?: string | null
          status?: string | null
          user_id: string
          void_space_percentage?: number | null
        }
        Update: {
          cost_savings?: number | null
          created_at?: string
          dpp_qr_url?: string | null
          id?: string
          integration_id?: string | null
          is_ppwr_compliant?: boolean | null
          order_date?: string | null
          order_id?: string | null
          order_number?: string
          pdf_url?: string | null
          platform?: string | null
          ppwr_qr_url?: string | null
          product_dimensions_height?: number | null
          product_dimensions_length?: number | null
          product_dimensions_width?: number | null
          product_id?: string | null
          product_name?: string
          recommended_box_id?: string | null
          recommended_box_name?: string | null
          status?: string | null
          user_id?: string
          void_space_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_reports_recommended_box_id_fkey"
            columns: ["recommended_box_id"]
            isOneToOne: false
            referencedRelation: "standard_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      dpp_data: {
        Row: {
          ai_generated: boolean | null
          carbon_footprint: number | null
          care_instructions: string | null
          certifications: string[] | null
          compliance_report_id: string
          created_at: string
          durability_rating: number | null
          end_of_life_options: string | null
          id: string
          material_composition: Json | null
          recyclability_score: number | null
          repair_instructions: string | null
          water_usage: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          carbon_footprint?: number | null
          care_instructions?: string | null
          certifications?: string[] | null
          compliance_report_id: string
          created_at?: string
          durability_rating?: number | null
          end_of_life_options?: string | null
          id?: string
          material_composition?: Json | null
          recyclability_score?: number | null
          repair_instructions?: string | null
          water_usage?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          carbon_footprint?: number | null
          care_instructions?: string | null
          certifications?: string[] | null
          compliance_report_id?: string
          created_at?: string
          durability_rating?: number | null
          end_of_life_options?: string | null
          id?: string
          material_composition?: Json | null
          recyclability_score?: number | null
          repair_instructions?: string | null
          water_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dpp_data_compliance_report_id_fkey"
            columns: ["compliance_report_id"]
            isOneToOne: false
            referencedRelation: "compliance_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      green_claims_reports: {
        Row: {
          compliance_report_id: string | null
          compliant_description: string | null
          created_at: string
          detected_claims: Json | null
          email_sent: boolean | null
          id: string
          original_description: string
          potential_fine: number | null
          product_id: string | null
          risk_score: number | null
          status: string | null
          unverified_claims: Json | null
          updated_at: string
          user_id: string
          verified_claims: Json | null
        }
        Insert: {
          compliance_report_id?: string | null
          compliant_description?: string | null
          created_at?: string
          detected_claims?: Json | null
          email_sent?: boolean | null
          id?: string
          original_description: string
          potential_fine?: number | null
          product_id?: string | null
          risk_score?: number | null
          status?: string | null
          unverified_claims?: Json | null
          updated_at?: string
          user_id: string
          verified_claims?: Json | null
        }
        Update: {
          compliance_report_id?: string | null
          compliant_description?: string | null
          created_at?: string
          detected_claims?: Json | null
          email_sent?: boolean | null
          id?: string
          original_description?: string
          potential_fine?: number | null
          product_id?: string | null
          risk_score?: number | null
          status?: string | null
          unverified_claims?: Json | null
          updated_at?: string
          user_id?: string
          verified_claims?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "green_claims_reports_compliance_report_id_fkey"
            columns: ["compliance_report_id"]
            isOneToOne: false
            referencedRelation: "compliance_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "green_claims_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          last_sync: string | null
          platform: string
          product_count: number | null
          refresh_token: string | null
          status: string | null
          store_name: string
          store_url: string | null
          user_id: string
          webhook_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          platform: string
          product_count?: number | null
          refresh_token?: string | null
          status?: string | null
          store_name: string
          store_url?: string | null
          user_id: string
          webhook_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          platform?: string
          product_count?: number | null
          refresh_token?: string | null
          status?: string | null
          store_name?: string
          store_url?: string | null
          user_id?: string
          webhook_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dimensions_height: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          dpp_category: string | null
          dpp_country_of_origin: string | null
          dpp_material: string | null
          dpp_recycling_info: string | null
          dpp_required: boolean | null
          external_id: string | null
          id: string
          integration_id: string | null
          materials: string | null
          name: string
          ppwr_category: string | null
          recycled_content: string | null
          synced_at: string | null
          user_id: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          dpp_category?: string | null
          dpp_country_of_origin?: string | null
          dpp_material?: string | null
          dpp_recycling_info?: string | null
          dpp_required?: boolean | null
          external_id?: string | null
          id?: string
          integration_id?: string | null
          materials?: string | null
          name: string
          ppwr_category?: string | null
          recycled_content?: string | null
          synced_at?: string | null
          user_id: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          dpp_category?: string | null
          dpp_country_of_origin?: string | null
          dpp_material?: string | null
          dpp_recycling_info?: string | null
          dpp_required?: boolean | null
          external_id?: string | null
          id?: string
          integration_id?: string | null
          materials?: string | null
          name?: string
          ppwr_category?: string | null
          recycled_content?: string | null
          synced_at?: string | null
          user_id?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      standard_boxes: {
        Row: {
          cost: number
          created_at: string
          height: number
          id: string
          length: number
          material: string | null
          name: string
          volume: number | null
          width: number
        }
        Insert: {
          cost: number
          created_at?: string
          height: number
          id?: string
          length: number
          material?: string | null
          name: string
          volume?: number | null
          width: number
        }
        Update: {
          cost?: number
          created_at?: string
          height?: number
          id?: string
          length?: number
          material?: string | null
          name?: string
          volume?: number | null
          width?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          language: string | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
