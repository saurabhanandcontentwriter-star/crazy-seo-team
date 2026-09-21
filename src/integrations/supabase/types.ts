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
      classified_account_registry: {
        Row: {
          created_at: string
          email: string
          id: string
          last_seen_at: string
          name: string
          phone: string
          profile_photo_url: string | null
          public_id: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_seen_at?: string
          name: string
          phone: string
          profile_photo_url?: string | null
          public_id: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_seen_at?: string
          name?: string
          phone?: string
          profile_photo_url?: string | null
          public_id?: string
          status?: string
        }
        Relationships: []
      }
      classified_listings: {
        Row: {
          brand: string | null
          business_name: string | null
          category: string
          city: string | null
          condition: string | null
          country: string | null
          country_code: string | null
          created_at: string
          description: string
          id: string
          is_business: boolean
          is_featured: boolean
          is_verified: boolean
          listing_type: string
          location_text: string | null
          pincode: string | null
          price: number | null
          price_type: string | null
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          state: string | null
          status: string
          subcategory: string | null
          title: string
          updated_at: string
          user_id: string | null
          views_count: number
        }
        Insert: {
          brand?: string | null
          business_name?: string | null
          category: string
          city?: string | null
          condition?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          description: string
          id?: string
          is_business?: boolean
          is_featured?: boolean
          is_verified?: boolean
          listing_type?: string
          location_text?: string | null
          pincode?: string | null
          price?: number | null
          price_type?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          state?: string | null
          status?: string
          subcategory?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          views_count?: number
        }
        Update: {
          brand?: string | null
          business_name?: string | null
          category?: string
          city?: string | null
          condition?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          description?: string
          id?: string
          is_business?: boolean
          is_featured?: boolean
          is_verified?: boolean
          listing_type?: string
          location_text?: string | null
          pincode?: string | null
          price?: number | null
          price_type?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          state?: string | null
          status?: string
          subcategory?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          views_count?: number
        }
        Relationships: []
      }
      classified_media: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          media_type: string
          public_url: string
          sort_order: number
          storage_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          media_type: string
          public_url: string
          sort_order?: number
          storage_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          media_type?: string
          public_url?: string
          sort_order?: number
          storage_path?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classified_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "classified_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      classified_profiles: {
        Row: {
          created_at: string
          email: string | null
          name: string
          phone: string
          profile_photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          name: string
          phone: string
          profile_photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          name?: string
          phone?: string
          profile_photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_applications: {
        Row: {
          admin_notes: string | null
          anvya_id: string | null
          bio: string | null
          country: string | null
          created_at: string
          creator_types: string[]
          date_of_birth: string | null
          district: string | null
          email: string
          gender: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          medium_url: string | null
          name: string
          reddit_url: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          anvya_id?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          creator_types?: string[]
          date_of_birth?: string | null
          district?: string | null
          email: string
          gender?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          medium_url?: string | null
          name: string
          reddit_url?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          anvya_id?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          creator_types?: string[]
          date_of_birth?: string | null
          district?: string | null
          email?: string
          gender?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          medium_url?: string | null
          name?: string
          reddit_url?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          actor_email: string | null
          body: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          lead_id: string
          outcome: string | null
          subject: string | null
          team_member_id: string | null
          type: string
        }
        Insert: {
          actor_email?: string | null
          body?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          lead_id: string
          outcome?: string | null
          subject?: string | null
          team_member_id?: string | null
          type?: string
        }
        Update: {
          actor_email?: string | null
          body?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          lead_id?: string
          outcome?: string | null
          subject?: string | null
          team_member_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_attendance: {
        Row: {
          created_at: string
          email: string
          id: string
          punch_in: string | null
          punch_out: string | null
          status: string
          total_seconds: number
          updated_at: string
          user_id: string | null
          work_date: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          punch_in?: string | null
          punch_out?: string | null
          status?: string
          total_seconds?: number
          updated_at?: string
          user_id?: string | null
          work_date?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          punch_in?: string | null
          punch_out?: string | null
          status?: string
          total_seconds?: number
          updated_at?: string
          user_id?: string | null
          work_date?: string
        }
        Relationships: []
      }
      crm_employee_profiles: {
        Row: {
          birthday: string | null
          created_at: string
          department: string | null
          designation: string | null
          id: string
          joining_date: string | null
          monthly_salary: number
          paid_leave_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          joining_date?: string | null
          monthly_salary?: number
          paid_leave_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          joining_date?: string | null
          monthly_salary?: number
          paid_leave_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_followups: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          lead_id: string
          notes: string | null
          reminder_minutes: number
          team_member_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          reminder_minutes?: number
          team_member_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          reminder_minutes?: number
          team_member_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_followups_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_holidays: {
        Row: {
          created_at: string
          holiday_date: string
          id: string
          name: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          holiday_date: string
          id?: string
          name: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          holiday_date?: string
          id?: string
          name?: string
          reason?: string | null
        }
        Relationships: []
      }
      crm_leave_requests: {
        Row: {
          created_at: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          total_days: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          total_days: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          total_days?: number
          user_id?: string
        }
        Relationships: []
      }
      crm_schema_records: {
        Row: {
          author: string
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
          schema_json: Json
          schema_type: string
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          author?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
          schema_json?: Json
          schema_type?: string
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Update: {
          author?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
          schema_json?: Json
          schema_type?: string
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_team_members: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          login_id: string | null
          mobile: string | null
          name: string
          photo_url: string | null
          position: string
          status: string
          updated_at: string
          working_days: string[]
          working_hours: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          login_id?: string | null
          mobile?: string | null
          name: string
          photo_url?: string | null
          position?: string
          status?: string
          updated_at?: string
          working_days?: string[]
          working_hours?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          login_id?: string | null
          mobile?: string | null
          name?: string
          photo_url?: string | null
          position?: string
          status?: string
          updated_at?: string
          working_days?: string[]
          working_hours?: string
        }
        Relationships: []
      }
      crm_workspace_items: {
        Row: {
          amount: number | null
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json
          module: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          module: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          module?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_center_conversations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          public_id: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          public_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          public_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      help_center_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          sender_type: string
          user_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          sender_type: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_center_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "help_center_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_account_registry: {
        Row: {
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          last_seen_at: string
          location: string | null
          middle_name: string | null
          public_id: string
          state: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string
          location?: string | null
          middle_name?: string | null
          public_id: string
          state?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string
          location?: string | null
          middle_name?: string | null
          public_id?: string
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      idea_badges: {
        Row: {
          badge_description: string | null
          badge_key: string
          badge_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_key: string
          badge_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_key?: string
          badge_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_communities: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          slug: string
          visibility: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          slug: string
          visibility?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          visibility?: string
        }
        Relationships: []
      }
      idea_community_members: {
        Row: {
          community_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "idea_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_event_rsvps: {
        Row: {
          created_at: string
          id: string
          post_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_event_rsvps_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "idea_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      idea_friendships: {
        Row: {
          addressee_id: string
          created_at: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      idea_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      idea_post_achievements: {
        Row: {
          achievement_description: string | null
          achievement_key: string
          achievement_name: string
          created_at: string
          id: string
          points_awarded: number
          post_id: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_key: string
          achievement_name: string
          created_at?: string
          id?: string
          points_awarded?: number
          post_id: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_key?: string
          achievement_name?: string
          created_at?: string
          id?: string
          points_awarded?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_post_achievements_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "idea_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "idea_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_post_reactions: {
        Row: {
          created_at: string
          post_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "idea_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_post_reshares: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_post_reshares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "idea_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_posts: {
        Row: {
          ai_detection_score: number | null
          ai_detection_signals: string[] | null
          content: string
          created_at: string
          creator_type: string | null
          device_type: string
          display_name: string | null
          event_end: string | null
          event_location: string | null
          event_max_attendees: number | null
          event_start: string | null
          event_url: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          location: string | null
          mobile: string | null
          moderation_checked_at: string | null
          moderation_decision: string | null
          moderation_links: Json | null
          moderation_reason: string | null
          moderation_score: number | null
          post_type: string
          profile_id: string
          profile_image_url: string | null
          rejection_reason: string | null
          scheduled_for: string | null
          show_mobile: boolean
          status: string
          subject: string
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
          visibility: string
        }
        Insert: {
          ai_detection_score?: number | null
          ai_detection_signals?: string[] | null
          content: string
          created_at?: string
          creator_type?: string | null
          device_type?: string
          display_name?: string | null
          event_end?: string | null
          event_location?: string | null
          event_max_attendees?: number | null
          event_start?: string | null
          event_url?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          location?: string | null
          mobile?: string | null
          moderation_checked_at?: string | null
          moderation_decision?: string | null
          moderation_links?: Json | null
          moderation_reason?: string | null
          moderation_score?: number | null
          post_type?: string
          profile_id: string
          profile_image_url?: string | null
          rejection_reason?: string | null
          scheduled_for?: string | null
          show_mobile?: boolean
          status?: string
          subject: string
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          visibility?: string
        }
        Update: {
          ai_detection_score?: number | null
          ai_detection_signals?: string[] | null
          content?: string
          created_at?: string
          creator_type?: string | null
          device_type?: string
          display_name?: string | null
          event_end?: string | null
          event_location?: string | null
          event_max_attendees?: number | null
          event_start?: string | null
          event_url?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          location?: string | null
          mobile?: string | null
          moderation_checked_at?: string | null
          moderation_decision?: string | null
          moderation_links?: Json | null
          moderation_reason?: string | null
          moderation_score?: number | null
          post_type?: string
          profile_id?: string
          profile_image_url?: string | null
          rejection_reason?: string | null
          scheduled_for?: string | null
          show_mobile?: boolean
          status?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      idea_presence: {
        Row: {
          last_seen_at: string
          online: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          online?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          online?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          ban_reason: string | null
          banned_until: string | null
          bio: string | null
          company: string | null
          country: string | null
          cover_url: string | null
          creator_rules_accepted_at: string | null
          creator_since: string | null
          creator_types: string[]
          date_of_birth: string | null
          display_name: string
          education: string | null
          email: string | null
          firebase_uid: string | null
          first_name: string | null
          github_url: string | null
          instagram_url: string | null
          is_creator: boolean
          last_name: string | null
          level: number
          linkedin_url: string | null
          location: string | null
          middle_name: string | null
          profile_slug: string | null
          public_id: string | null
          reputation_points: number
          state: string | null
          subjects: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          verification_status: string
          verified: boolean
          website_url: string | null
          working: string | null
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          company?: string | null
          country?: string | null
          cover_url?: string | null
          creator_rules_accepted_at?: string | null
          creator_since?: string | null
          creator_types?: string[]
          date_of_birth?: string | null
          display_name: string
          education?: string | null
          email?: string | null
          firebase_uid?: string | null
          first_name?: string | null
          github_url?: string | null
          instagram_url?: string | null
          is_creator?: boolean
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          location?: string | null
          middle_name?: string | null
          profile_slug?: string | null
          public_id?: string | null
          reputation_points?: number
          state?: string | null
          subjects?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verified?: boolean
          website_url?: string | null
          working?: string | null
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          company?: string | null
          country?: string | null
          cover_url?: string | null
          creator_rules_accepted_at?: string | null
          creator_since?: string | null
          creator_types?: string[]
          date_of_birth?: string | null
          display_name?: string
          education?: string | null
          email?: string | null
          firebase_uid?: string | null
          first_name?: string | null
          github_url?: string | null
          instagram_url?: string | null
          is_creator?: boolean
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          location?: string | null
          middle_name?: string | null
          profile_slug?: string | null
          public_id?: string | null
          reputation_points?: number
          state?: string | null
          subjects?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified?: boolean
          website_url?: string | null
          working?: string | null
        }
        Relationships: []
      }
      idea_stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string | null
          text_content: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type: string
          media_url?: string | null
          text_content?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string | null
          text_content?: string | null
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      idea_story_highlight_items: {
        Row: {
          created_at: string
          highlight_id: string
          id: string
          media_type: string | null
          media_url: string | null
          story_id: string | null
          text_content: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          highlight_id: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          story_id?: string | null
          text_content?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          highlight_id?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          story_id?: string | null
          text_content?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_story_highlight_items_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "idea_story_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_story_highlight_items_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "idea_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_story_highlights: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_verification_requests: {
        Row: {
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_path: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path?: string
          status?: string
          user_id?: string
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
          assigned_to: string | null
          city: string | null
          company: string | null
          consent: boolean
          country: string | null
          created_at: string
          deal_value: number
          district: string | null
          email: string
          full_name: string
          id: string
          last_contact_at: string | null
          message: string | null
          next_follow_up_at: string | null
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
          assigned_to?: string | null
          city?: string | null
          company?: string | null
          consent?: boolean
          country?: string | null
          created_at?: string
          deal_value?: number
          district?: string | null
          email: string
          full_name: string
          id?: string
          last_contact_at?: string | null
          message?: string | null
          next_follow_up_at?: string | null
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
          assigned_to?: string | null
          city?: string | null
          company?: string | null
          consent?: boolean
          country?: string | null
          created_at?: string
          deal_value?: number
          district?: string | null
          email?: string
          full_name?: string
          id?: string
          last_contact_at?: string | null
          message?: string | null
          next_follow_up_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string
          faqs: Json
          focus_keyword: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          nlp_keywords: string[]
          published_at: string
          reading_minutes: number
          slug: string
          source: string | null
          source_published_at: string | null
          source_url: string | null
          summary: string
          title: string
          topics: string[]
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          faqs?: Json
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nlp_keywords?: string[]
          published_at?: string
          reading_minutes?: number
          slug: string
          source?: string | null
          source_published_at?: string | null
          source_url?: string | null
          summary?: string
          title: string
          topics?: string[]
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          faqs?: Json
          focus_keyword?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nlp_keywords?: string[]
          published_at?: string
          reading_minutes?: number
          slug?: string
          source?: string | null
          source_published_at?: string | null
          source_url?: string | null
          summary?: string
          title?: string
          topics?: string[]
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
          is_heartbeat: boolean
          latitude: number | null
          location_accuracy_m: number | null
          longitude: number | null
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
          is_heartbeat?: boolean
          latitude?: number | null
          location_accuracy_m?: number | null
          longitude?: number | null
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
          is_heartbeat?: boolean
          latitude?: number | null
          location_accuracy_m?: number | null
          longitude?: number | null
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
      delete_old_idea_posts: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_ideas_directory: {
        Args: { p_query?: string }
        Returns: {
          country: string
          display_name: string
          last_seen_at: string
          public_id: string
          state: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "crm_team"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "crm_team"],
    },
  },
} as const
