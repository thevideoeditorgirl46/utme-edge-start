export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          admin_id: string;
          created_at: string;
          id: string;
          new_status: string | null;
          previous_status: string | null;
          reason: string | null;
          submission_id: string | null;
          target_user_id: string | null;
        };
        Insert: {
          action: string;
          admin_id: string;
          created_at?: string;
          id?: string;
          new_status?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          submission_id?: string | null;
          target_user_id?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string;
          created_at?: string;
          id?: string;
          new_status?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          submission_id?: string | null;
          target_user_id?: string | null;
        };
        Relationships: [];
      };
      class_links: {
        Row: {
          flyer_url: string | null;
          id: number;
          telegram_biology_url: string | null;
          telegram_chemistry_url: string | null;
          telegram_english_url: string | null;
          telegram_math_url: string | null;
          telegram_physics_url: string | null;
          telegram_url: string | null;
          updated_at: string;
          whatsapp_channel_url: string | null;
          whatsapp_group_url: string | null;
          whatsapp_url: string | null;
        };
        Insert: {
          flyer_url?: string | null;
          id?: number;
          telegram_biology_url?: string | null;
          telegram_chemistry_url?: string | null;
          telegram_english_url?: string | null;
          telegram_math_url?: string | null;
          telegram_physics_url?: string | null;
          telegram_url?: string | null;
          updated_at?: string;
          whatsapp_channel_url?: string | null;
          whatsapp_group_url?: string | null;
          whatsapp_url?: string | null;
        };
        Update: {
          flyer_url?: string | null;
          id?: number;
          telegram_biology_url?: string | null;
          telegram_chemistry_url?: string | null;
          telegram_english_url?: string | null;
          telegram_math_url?: string | null;
          telegram_physics_url?: string | null;
          telegram_url?: string | null;
          updated_at?: string;
          whatsapp_channel_url?: string | null;
          whatsapp_group_url?: string | null;
          whatsapp_url?: string | null;
        };
        Relationships: [];
      };
      practice_attempts: {
        Row: {
          created_at: string;
          id: string;
          is_correct: boolean;
          question_id: string;
          selected_option: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_correct: boolean;
          question_id: string;
          selected_option: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          question_id?: string;
          selected_option?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_attempts_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "practice_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      practice_questions: {
        Row: {
          correct_option: string;
          created_at: string;
          explanation: string | null;
          id: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          prompt: string;
          set_id: string;
          sort_order: number;
        };
        Insert: {
          correct_option: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          prompt: string;
          set_id: string;
          sort_order?: number;
        };
        Update: {
          correct_option?: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          prompt?: string;
          set_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "practice_questions_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "practice_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      practice_sets: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          published: boolean;
          sort_order: number;
          subject: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          published?: boolean;
          sort_order?: number;
          subject?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          published?: boolean;
          sort_order?: number;
          subject?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      practice_subjects: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      practice_topics: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          subject_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          subject_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          subject_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_topics_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "practice_subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          registration_id: string;
          telegram_username: string | null;
          updated_at: string;
          whatsapp_number: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          registration_id: string;
          telegram_username?: string | null;
          updated_at?: string;
          whatsapp_number: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          registration_id?: string;
          telegram_username?: string | null;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
      question_attempts: {
        Row: {
          created_at: string;
          id: string;
          is_correct: boolean;
          question_id: string;
          selected_option: string;
          topic_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_correct: boolean;
          question_id: string;
          selected_option: string;
          topic_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          question_id?: string;
          selected_option?: string;
          topic_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_attempts_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "practice_topics";
            referencedColumns: ["id"];
          },
        ];
      };
      question_bookmarks: {
        Row: {
          created_at: string;
          id: string;
          question_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          question_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          question_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_bookmarks_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      question_notes: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          question_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          question_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          question_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_notes_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      question_revisions: {
        Row: {
          created_at: string;
          edited_by: string | null;
          id: string;
          question_id: string;
          revision: number;
          snapshot: Json;
        };
        Insert: {
          created_at?: string;
          edited_by?: string | null;
          id?: string;
          question_id: string;
          revision: number;
          snapshot: Json;
        };
        Update: {
          created_at?: string;
          edited_by?: string | null;
          id?: string;
          question_id?: string;
          revision?: number;
          snapshot?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "question_revisions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          correct_option: string;
          created_at: string;
          created_by: string | null;
          explanation: string | null;
          id: string;
          image_url: string | null;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          prompt: string;
          revision: number;
          sort_order: number;
          source: string | null;
          status: Database["public"]["Enums"]["question_status"];
          topic_id: string;
          updated_at: string;
        };
        Insert: {
          correct_option: string;
          created_at?: string;
          created_by?: string | null;
          explanation?: string | null;
          id?: string;
          image_url?: string | null;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          prompt: string;
          revision?: number;
          sort_order?: number;
          source?: string | null;
          status?: Database["public"]["Enums"]["question_status"];
          topic_id: string;
          updated_at?: string;
        };
        Update: {
          correct_option?: string;
          created_at?: string;
          created_by?: string | null;
          explanation?: string | null;
          id?: string;
          image_url?: string | null;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          prompt?: string;
          revision?: number;
          sort_order?: number;
          source?: string | null;
          status?: Database["public"]["Enums"]["question_status"];
          topic_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "practice_topics";
            referencedColumns: ["id"];
          },
        ];
      };
      registrations: {
        Row: {
          challenge_areas: string[];
          created_at: string;
          id: string;
          improvement_goal: string | null;
          previous_score: number | null;
          referral_source: string;
          subjects: string[];
          user_id: string;
          utme_year: string;
          written_before: boolean;
        };
        Insert: {
          challenge_areas?: string[];
          created_at?: string;
          id?: string;
          improvement_goal?: string | null;
          previous_score?: number | null;
          referral_source: string;
          subjects?: string[];
          user_id: string;
          utme_year: string;
          written_before?: boolean;
        };
        Update: {
          challenge_areas?: string[];
          created_at?: string;
          id?: string;
          improvement_goal?: string | null;
          previous_score?: number | null;
          referral_source?: string;
          subjects?: string[];
          user_id?: string;
          utme_year?: string;
          written_before?: boolean;
        };
        Relationships: [];
      };
      reward_unlocks: {
        Row: {
          id: string;
          source: string;
          unlocked_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          source?: string;
          unlocked_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          source?: string;
          unlocked_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      share_verifications: {
        Row: {
          automated_recommendation: string | null;
          automated_score: number | null;
          claimed_points: number;
          created_at: string;
          fraud_flags: string[];
          fraud_score: number;
          id: string;
          image_hash: string | null;
          image_path: string;
          perceptual_hash: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          share_type: string;
          status: string;
          student_id: string;
          updated_at: string;
          verification_method: string;
        };
        Insert: {
          automated_recommendation?: string | null;
          automated_score?: number | null;
          claimed_points?: number;
          created_at?: string;
          fraud_flags?: string[];
          fraud_score?: number;
          id?: string;
          image_hash?: string | null;
          image_path: string;
          perceptual_hash?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          share_type: string;
          status?: string;
          student_id: string;
          updated_at?: string;
          verification_method?: string;
        };
        Update: {
          automated_recommendation?: string | null;
          automated_score?: number | null;
          claimed_points?: number;
          created_at?: string;
          fraud_flags?: string[];
          fraud_score?: number;
          id?: string;
          image_hash?: string | null;
          image_path?: string;
          perceptual_hash?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          share_type?: string;
          status?: string;
          student_id?: string;
          updated_at?: string;
          verification_method?: string;
        };
        Relationships: [];
      };
      sharing_submissions: {
        Row: {
          created_at: string;
          id: string;
          image_path: string;
          reviewed_at: string | null;
          status: string;
          user_id: string;
          verification_note: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path: string;
          reviewed_at?: string | null;
          status?: string;
          user_id: string;
          verification_note?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string;
          reviewed_at?: string | null;
          status?: string;
          user_id?: string;
          verification_note?: string | null;
        };
        Relationships: [];
      };
      success_stories: {
        Row: {
          created_at: string;
          excerpt: string;
          featured: boolean;
          full_story: string;
          id: string;
          photo_url: string | null;
          published: boolean;
          result_image_url: string | null;
          sort_order: number;
          student_name: string;
          utme_score: number;
        };
        Insert: {
          created_at?: string;
          excerpt: string;
          featured?: boolean;
          full_story: string;
          id?: string;
          photo_url?: string | null;
          published?: boolean;
          result_image_url?: string | null;
          sort_order?: number;
          student_name: string;
          utme_score: number;
        };
        Update: {
          created_at?: string;
          excerpt?: string;
          featured?: boolean;
          full_story?: string;
          id?: string;
          photo_url?: string | null;
          published?: boolean;
          result_image_url?: string | null;
          sort_order?: number;
          student_name?: string;
          utme_score?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      verification_settings: {
        Row: {
          auto_approve_enabled: boolean;
          auto_approve_max_fraud: number;
          auto_approve_min_confidence: number;
          auto_reject_min_fraud: number;
          created_at: string;
          friend_points: number;
          group_points: number;
          id: number;
          required_points: number;
          updated_at: string;
        };
        Insert: {
          auto_approve_enabled?: boolean;
          auto_approve_max_fraud?: number;
          auto_approve_min_confidence?: number;
          auto_reject_min_fraud?: number;
          created_at?: string;
          friend_points?: number;
          group_points?: number;
          id?: number;
          required_points?: number;
          updated_at?: string;
        };
        Update: {
          auto_approve_enabled?: boolean;
          auto_approve_max_fraud?: number;
          auto_approve_min_confidence?: number;
          auto_reject_min_fraud?: number;
          created_at?: string;
          friend_points?: number;
          group_points?: number;
          id?: number;
          required_points?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      verified_share_points: { Args: { _user_id: string }; Returns: number };
    };
    Enums: {
      app_role: "admin" | "student";
      question_status: "draft" | "pending" | "approved" | "published" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      question_status: ["draft", "pending", "approved", "published", "archived"],
    },
  },
} as const;
