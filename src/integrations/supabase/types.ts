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
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          author_bio: string | null
          author_img: string | null
          author_linkedin: string | null
          author_role: string
          content: string
          created_at: string
          created_by: string | null
          description: string
          hero_image: string | null
          hero_image_alt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          published_at: string
          slug: string
          source: string
          tag: string
          target_keyword: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          author_bio?: string | null
          author_img?: string | null
          author_linkedin?: string | null
          author_role?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string
          slug: string
          source?: string
          tag?: string
          target_keyword?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_bio?: string | null
          author_img?: string | null
          author_linkedin?: string | null
          author_role?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string
          slug?: string
          source?: string
          tag?: string
          target_keyword?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          author_email: string | null
          created_at: string
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          author_email?: string | null
          created_at?: string
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          author_email?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string | null
          company: string | null
          consent: boolean
          country: string | null
          created_at: string
          district: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          page_path: string | null
          phone: string
          phone_country: string
          preferred_contact: string | null
          score: number
          service: string
          session_id: string | null
          source: string
          state: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          consent?: boolean
          country?: string | null
          created_at?: string
          district?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          page_path?: string | null
          phone: string
          phone_country?: string
          preferred_contact?: string | null
          score?: number
          service: string
          session_id?: string | null
          source?: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          consent?: boolean
          country?: string | null
          created_at?: string
          district?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          page_path?: string | null
          phone?: string
          phone_country?: string
          preferred_contact?: string | null
          score?: number
          service?: string
          session_id?: string | null
          source?: string
          state?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          mfa_verified: boolean
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          mfa_verified?: boolean
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          mfa_verified?: boolean
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string
          faqs: Json | null
          focus_keyword: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          nlp_keywords: string[] | null
          published_at: string
          reading_minutes: number | null
          slug: string
          source: string | null
          summary: string
          title: string
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          faqs?: Json | null
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nlp_keywords?: string[] | null
          published_at?: string
          reading_minutes?: number | null
          slug: string
          source?: string | null
          summary?: string
          title: string
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          faqs?: Json | null
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nlp_keywords?: string[] | null
          published_at?: string
          reading_minutes?: number | null
          slug?: string
          source?: string | null
          summary?: string
          title?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          device: string | null
          id: string
          os: string | null
          path: string
          referrer: string | null
          region: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device?: string | null
          id?: string
          os?: string | null
          path: string
          referrer?: string | null
          region?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device?: string | null
          id?: string
          os?: string | null
          path?: string
          referrer?: string | null
          region?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          tool_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          tool_name: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          tool_name?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
