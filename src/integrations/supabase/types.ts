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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      class_links: {
        Row: {
          flyer_url: string | null
          id: number
          telegram_url: string | null
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          flyer_url?: string | null
          id?: number
          telegram_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          flyer_url?: string | null
          id?: number
          telegram_url?: string | null
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      practice_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "practice_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_questions: {
        Row: {
          correct_option: string
          created_at: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          prompt: string
          set_id: string
          sort_order: number
        }
        Insert: {
          correct_option: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          prompt: string
          set_id: string
          sort_order?: number
        }
        Update: {
          correct_option?: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          prompt?: string
          set_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "practice_questions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "practice_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          published: boolean
          sort_order: number
          subject: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          subject?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          subject?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          registration_id: string
          telegram_username: string | null
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          registration_id: string
          telegram_username?: string | null
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          registration_id?: string
          telegram_username?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          challenge_areas: string[]
          created_at: string
          id: string
          improvement_goal: string | null
          previous_score: number | null
          referral_source: string
          subjects: string[]
          user_id: string
          utme_year: string
          written_before: boolean
        }
        Insert: {
          challenge_areas?: string[]
          created_at?: string
          id?: string
          improvement_goal?: string | null
          previous_score?: number | null
          referral_source: string
          subjects?: string[]
          user_id: string
          utme_year: string
          written_before?: boolean
        }
        Update: {
          challenge_areas?: string[]
          created_at?: string
          id?: string
          improvement_goal?: string | null
          previous_score?: number | null
          referral_source?: string
          subjects?: string[]
          user_id?: string
          utme_year?: string
          written_before?: boolean
        }
        Relationships: []
      }
      reward_unlocks: {
        Row: {
          id: string
          source: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          source?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          source?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sharing_submissions: {
        Row: {
          created_at: string
          id: string
          image_path: string
          reviewed_at: string | null
          status: string
          user_id: string
          verification_note: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          reviewed_at?: string | null
          status?: string
          user_id: string
          verification_note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
          verification_note?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          created_at: string
          excerpt: string
          featured: boolean
          full_story: string
          id: string
          photo_url: string | null
          published: boolean
          result_image_url: string | null
          sort_order: number
          student_name: string
          utme_score: number
        }
        Insert: {
          created_at?: string
          excerpt: string
          featured?: boolean
          full_story: string
          id?: string
          photo_url?: string | null
          published?: boolean
          result_image_url?: string | null
          sort_order?: number
          student_name: string
          utme_score: number
        }
        Update: {
          created_at?: string
          excerpt?: string
          featured?: boolean
          full_story?: string
          id?: string
          photo_url?: string | null
          published?: boolean
          result_image_url?: string | null
          sort_order?: number
          student_name?: string
          utme_score?: number
        }
        Relationships: []
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
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
