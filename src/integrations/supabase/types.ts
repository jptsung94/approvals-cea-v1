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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approval_rules: {
        Row: {
          applies_to: string[] | null
          created_at: string
          created_by: string | null
          criteria: Json | null
          description: string | null
          id: string
          name: string
          rule_type: string
          status: string
          updated_at: string
        }
        Insert: {
          applies_to?: string[] | null
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          name: string
          rule_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          applies_to?: string[] | null
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          name?: string
          rule_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      approver_favorites: {
        Row: {
          approver_email: string
          approver_id: string
          approver_name: string
          approver_role: string | null
          created_at: string | null
          id: string
          last_used_at: string | null
          times_used: number | null
          user_id: string
        }
        Insert: {
          approver_email: string
          approver_id: string
          approver_name: string
          approver_role?: string | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          times_used?: number | null
          user_id: string
        }
        Update: {
          approver_email?: string
          approver_id?: string
          approver_name?: string
          approver_role?: string | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          times_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      asset_approvers: {
        Row: {
          approved_at: string | null
          approver_id: string
          approver_name: string
          approver_role: string | null
          asset_id: string
          created_at: string
          id: string
          is_required: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          approver_name: string
          approver_role?: string | null
          asset_id: string
          created_at?: string
          id?: string
          is_required?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          approver_name?: string
          approver_role?: string | null
          asset_id?: string
          created_at?: string
          id?: string
          is_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_approvers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          approved_at: string | null
          auto_approval_eligible: boolean | null
          category: string | null
          created_at: string
          current_step: string | null
          data_classification: Database["public"]["Enums"]["data_classification"]
          description: string | null
          documentation_url: string | null
          endpoint: string | null
          format: string | null
          governance_checks: string | null
          has_personal_data: boolean | null
          id: string
          metadata: Json | null
          name: string
          priority: string
          producer_id: string
          quality_score: number | null
          rejected_at: string | null
          retention_period: string | null
          risk_score: number | null
          size: string | null
          sla_target: string | null
          status: Database["public"]["Enums"]["asset_status"]
          submitted_at: string
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          auto_approval_eligible?: boolean | null
          category?: string | null
          created_at?: string
          current_step?: string | null
          data_classification?: Database["public"]["Enums"]["data_classification"]
          description?: string | null
          documentation_url?: string | null
          endpoint?: string | null
          format?: string | null
          governance_checks?: string | null
          has_personal_data?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          priority?: string
          producer_id: string
          quality_score?: number | null
          rejected_at?: string | null
          retention_period?: string | null
          risk_score?: number | null
          size?: string | null
          sla_target?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          submitted_at?: string
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          auto_approval_eligible?: boolean | null
          category?: string | null
          created_at?: string
          current_step?: string | null
          data_classification?: Database["public"]["Enums"]["data_classification"]
          description?: string | null
          documentation_url?: string | null
          endpoint?: string | null
          format?: string | null
          governance_checks?: string | null
          has_personal_data?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          priority?: string
          producer_id?: string
          quality_score?: number | null
          rejected_at?: string | null
          retention_period?: string | null
          risk_score?: number | null
          size?: string | null
          sla_target?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          submitted_at?: string
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          asset_id: string
          author_id: string
          author_name: string
          comment_type: Database["public"]["Enums"]["comment_type"]
          created_at: string
          id: string
          message: string
        }
        Insert: {
          asset_id: string
          author_id: string
          author_name: string
          comment_type?: Database["public"]["Enums"]["comment_type"]
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          asset_id?: string
          author_id?: string
          author_name?: string
          comment_type?: Database["public"]["Enums"]["comment_type"]
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      delegates: {
        Row: {
          assigned_date: string
          created_at: string
          delegate_email: string
          delegate_id: string
          delegate_name: string
          delegator_id: string
          expiry_date: string | null
          id: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          delegate_email: string
          delegate_id: string
          delegate_name: string
          delegator_id: string
          expiry_date?: string | null
          id?: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          delegate_email?: string
          delegate_id?: string
          delegate_name?: string
          delegator_id?: string
          expiry_date?: string | null
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          actor_id: string | null
          actor_name: string
          asset_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id: string
          message: string
        }
        Insert: {
          actor_id?: string | null
          actor_name: string
          asset_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          message: string
        }
        Update: {
          actor_id?: string | null
          actor_name?: string
          asset_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "steward" | "producer"
      asset_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "auto_approved"
      asset_type: "dataset" | "api" | "stream" | "model"
      comment_type: "feedback" | "question" | "approval"
      data_classification: "public" | "internal" | "confidential"
      timeline_event_type:
        | "submitted"
        | "review_started"
        | "comment"
        | "approved"
        | "rejected"
        | "escalated"
        | "reassigned"
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
      app_role: ["admin", "steward", "producer"],
      asset_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "auto_approved",
      ],
      asset_type: ["dataset", "api", "stream", "model"],
      comment_type: ["feedback", "question", "approval"],
      data_classification: ["public", "internal", "confidential"],
      timeline_event_type: [
        "submitted",
        "review_started",
        "comment",
        "approved",
        "rejected",
        "escalated",
        "reassigned",
      ],
    },
  },
} as const
