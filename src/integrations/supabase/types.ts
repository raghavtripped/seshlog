///Users/raghavtripathi/Projects 2.0/session-scribe-log/src/integrations/supabase/types.ts

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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      daily_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      poker_buy_ins: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          note: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poker_buy_ins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poker_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poker_buy_ins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poker_sessions_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      poker_key_hands: {
        Row: {
          board: string | null
          created_at: string
          hole_cards: string | null
          id: string
          note: string | null
          position: string | null
          pot_size: number | null
          result_amount: number | null
          session_id: string
          tag: string | null
          user_id: string
        }
        Insert: {
          board?: string | null
          created_at?: string
          hole_cards?: string | null
          id?: string
          note?: string | null
          position?: string | null
          pot_size?: number | null
          result_amount?: number | null
          session_id: string
          tag?: string | null
          user_id: string
        }
        Update: {
          board?: string | null
          created_at?: string
          hole_cards?: string | null
          id?: string
          note?: string | null
          position?: string | null
          pot_size?: number | null
          result_amount?: number | null
          session_id?: string
          tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poker_key_hands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poker_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poker_key_hands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "poker_sessions_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      poker_presets: {
        Row: {
          ante: number | null
          big_blind: number | null
          created_at: string
          currency: string | null
          default_buyin: number | null
          game_type: string | null
          id: string
          label: string
          max_buyin: number | null
          session_type: string | null
          small_blind: number | null
          straddle: number | null
          user_id: string
          venue: string | null
        }
        Insert: {
          ante?: number | null
          big_blind?: number | null
          created_at?: string
          currency?: string | null
          default_buyin?: number | null
          game_type?: string | null
          id?: string
          label: string
          max_buyin?: number | null
          session_type?: string | null
          small_blind?: number | null
          straddle?: number | null
          user_id: string
          venue?: string | null
        }
        Update: {
          ante?: number | null
          big_blind?: number | null
          created_at?: string
          currency?: string | null
          default_buyin?: number | null
          game_type?: string | null
          id?: string
          label?: string
          max_buyin?: number | null
          session_type?: string | null
          small_blind?: number | null
          straddle?: number | null
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      poker_profiles: {
        Row: {
          base_currency: string
          created_at: string
          default_currency: string
          timezone: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          default_currency?: string
          timezone?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          default_currency?: string
          timezone?: string
          user_id?: string
        }
        Relationships: []
      }
      poker_sessions: {
        Row: {
          ante: number | null
          big_blind: number
          cash_out: number | null
          created_at: string
          currency: string
          ended_at: string | null
          est_hands: number | null
          focus: number | null
          fx_rate_to_base: number
          game_type: string | null
          id: string
          max_buyin: number | null
          mood: number | null
          notes: string | null
          session_type: string | null
          sleep_hours: number | null
          small_blind: number
          started_at: string
          straddle: number | null
          tilt: boolean | null
          user_id: string
          venue: string | null
        }
        Insert: {
          ante?: number | null
          big_blind: number
          cash_out?: number | null
          created_at?: string
          currency: string
          ended_at?: string | null
          est_hands?: number | null
          focus?: number | null
          fx_rate_to_base?: number
          game_type?: string | null
          id?: string
          max_buyin?: number | null
          mood?: number | null
          notes?: string | null
          session_type?: string | null
          sleep_hours?: number | null
          small_blind: number
          started_at?: string
          straddle?: number | null
          tilt?: boolean | null
          user_id: string
          venue?: string | null
        }
        Update: {
          ante?: number | null
          big_blind?: number
          cash_out?: number | null
          created_at?: string
          currency?: string
          ended_at?: string | null
          est_hands?: number | null
          focus?: number | null
          fx_rate_to_base?: number
          game_type?: string | null
          id?: string
          max_buyin?: number | null
          mood?: number | null
          notes?: string | null
          session_type?: string | null
          sleep_hours?: number | null
          small_blind?: number
          started_at?: string
          straddle?: number | null
          tilt?: boolean | null
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          items: Json
          name: string
          user_id: string
        }
        Insert: {
          id?: string
          items: Json
          name: string
          user_id: string
        }
        Update: {
          id?: string
          items?: Json
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          category: Database["public"]["Enums"]["session_category"]
          created_at: string
          id: string
          liquor_serving_size: string | null
          notes: string | null
          participant_count: number
          quantity: number
          rating: number | null
          session_date: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["session_category"]
          created_at?: string
          id?: string
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number
          quantity: number
          rating?: number | null
          session_date: string
          session_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["session_category"]
          created_at?: string
          id?: string
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number
          quantity?: number
          rating?: number | null
          session_date?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions_backup: {
        Row: {
          category: Database["public"]["Enums"]["session_category"] | null
          created_at: string | null
          id: string | null
          liquor_serving_size: string | null
          notes: string | null
          participant_count: number | null
          quantity: number | null
          rating: number | null
          session_date: string | null
          session_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["session_category"] | null
          created_at?: string | null
          id?: string | null
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number | null
          quantity?: number | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["session_category"] | null
          created_at?: string | null
          id?: string | null
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number | null
          quantity?: number | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sessions_backup_cigs: {
        Row: {
          category: Database["public"]["Enums"]["session_category"] | null
          created_at: string | null
          id: string | null
          liquor_serving_size: string | null
          notes: string | null
          participant_count: number | null
          quantity: number | null
          rating: number | null
          session_date: string | null
          session_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["session_category"] | null
          created_at?: string | null
          id?: string | null
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number | null
          quantity?: number | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["session_category"] | null
          created_at?: string | null
          id?: string | null
          liquor_serving_size?: string | null
          notes?: string | null
          participant_count?: number | null
          quantity?: number | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          generated_at: string
          id: string
          insight_text: string
          priority: number
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          insight_text: string
          priority?: number
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          insight_text?: string
          priority?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      poker_sessions_with_stats: {
        Row: {
          ante: number | null
          bb_won: number | null
          big_blind: number | null
          cash_out: number | null
          created_at: string | null
          currency: string | null
          duration_minutes: number | null
          ended_at: string | null
          est_hands: number | null
          focus: number | null
          fx_rate_to_base: number | null
          game_type: string | null
          id: string | null
          max_buyin: number | null
          mood: number | null
          net_base: number | null
          net_native: number | null
          notes: string | null
          session_type: string | null
          sleep_hours: number | null
          small_blind: number | null
          started_at: string | null
          straddle: number | null
          tilt: boolean | null
          total_buyin_native: number | null
          user_id: string | null
          venue: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_default_routines_for_user: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      create_user_insights_table: { Args: never; Returns: undefined }
    }
    Enums: {
      session_category:
        | "liquor"
        | "cannabis"
        | "tobacco"
        | "caffeine"
        | "weed"
        | "cigs"
        | "vapes"
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
      session_category: [
        "liquor",
        "cannabis",
        "tobacco",
        "caffeine",
        "weed",
        "cigs",
        "vapes",
      ],
    },
  },
} as const
