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
      appointment_records: {
        Row: {
          appointment_id: string
          company_id: string
          created_at: string
          created_by: string
          end_time: string
          id: string
          next_steps: string | null
          notes: string | null
          objections: string | null
          outcome: string | null
          start_time: string
          summary: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          company_id: string
          created_at?: string
          created_by: string
          end_time: string
          id?: string
          next_steps?: string | null
          notes?: string | null
          objections?: string | null
          outcome?: string | null
          start_time: string
          summary: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          end_time?: string
          id?: string
          next_steps?: string | null
          notes?: string | null
          objections?: string | null
          outcome?: string | null
          start_time?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          assigned_to: string
          company_id: string
          created_at: string
          date: string
          description: string | null
          duration: number | null
          id: string
          lead_id: string
          meeting_url: string | null
          reschedule_reason: string | null
          rescheduled_from_id: string | null
          scheduled_by: string
          status: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          company_id: string
          created_at?: string
          date: string
          description?: string | null
          duration?: number | null
          id?: string
          lead_id: string
          meeting_url?: string | null
          reschedule_reason?: string | null
          rescheduled_from_id?: string | null
          scheduled_by: string
          status?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          company_id?: string
          created_at?: string
          date?: string
          description?: string | null
          duration?: number | null
          id?: string
          lead_id?: string
          meeting_url?: string | null
          reschedule_reason?: string | null
          rescheduled_from_id?: string | null
          scheduled_by?: string
          status?: string | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_scheduled_by_fkey"
            columns: ["scheduled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          currency: string | null
          date_format: string | null
          domain: string | null
          email_notifications: boolean | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          size: string | null
          status: string | null
          timezone: string | null
          updated_at: string
          website: string | null
          whatsapp_enabled: boolean | null
          whatsapp_message: string | null
          whatsapp_notifications: boolean | null
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          date_format?: string | null
          domain?: string | null
          email_notifications?: boolean | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          size?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_message?: string | null
          whatsapp_notifications?: boolean | null
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          date_format?: string | null
          domain?: string | null
          email_notifications?: boolean | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          size?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_message?: string | null
          whatsapp_notifications?: boolean | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      company_role_permissions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          permissions: Json
          role_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          permissions?: Json
          role_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          permissions?: Json
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_role_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_role_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assigned_to: string | null
          company_id: string
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          duration: string | null
          id: string
          institution_id: string
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          institution_id: string
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          institution_id?: string
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          semester: string
          status: string
          student_id: string
          updated_at: string
          value: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          semester: string
          status?: string
          student_id: string
          updated_at?: string
          value: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          semester?: string
          status?: string
          student_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          appointment_id: string
          appointment_record_id: string | null
          channel: string
          company_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          meeting_url: string | null
          message_sent: string | null
          notes: string | null
          response_date: string | null
          response_received: string | null
          result: string | null
          scheduled_date: string
          scheduled_time: string
          sequence_number: number
          updated_at: string
        }
        Insert: {
          appointment_id: string
          appointment_record_id?: string | null
          channel: string
          company_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          meeting_url?: string | null
          message_sent?: string | null
          notes?: string | null
          response_date?: string | null
          response_received?: string | null
          result?: string | null
          scheduled_date: string
          scheduled_time: string
          sequence_number?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          appointment_record_id?: string | null
          channel?: string
          company_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          meeting_url?: string | null
          message_sent?: string | null
          notes?: string | null
          response_date?: string | null
          response_received?: string | null
          result?: string | null
          scheduled_date?: string
          scheduled_time?: string
          sequence_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_appointment_record_id_fkey"
            columns: ["appointment_record_id"]
            isOneToOne: false
            referencedRelation: "appointment_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_tag_assignments: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_tag_assignments_lead"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lead_tag_assignments_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lead_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_tags_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lead_tags_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          partner_id: string | null
          phone: string | null
          product_name: string | null
          product_value: number | null
          revenue_generated: number | null
          revenue_lost: number | null
          source: string | null
          status: string | null
          temperature: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          partner_id?: string | null
          phone?: string | null
          product_name?: string | null
          product_value?: number | null
          revenue_generated?: number | null
          revenue_lost?: number | null
          source?: string | null
          status?: string | null
          temperature?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          partner_id?: string | null
          phone?: string | null
          product_name?: string | null
          product_value?: number | null
          revenue_generated?: number | null
          revenue_lost?: number | null
          source?: string | null
          status?: string | null
          temperature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_agendas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          meeting_id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          meeting_id: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          meeting_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agendas_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attachments: {
        Row: {
          created_at: string
          created_by: string
          file_size: number | null
          id: string
          meeting_id: string
          mime_type: string | null
          name: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          file_size?: number | null
          id?: string
          meeting_id: string
          mime_type?: string | null
          name: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          file_size?: number | null
          id?: string
          meeting_id?: string
          mime_type?: string | null
          name?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attachments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attachments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          content: string
          created_at: string
          id: string
          meeting_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meeting_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meeting_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          attendance_marked_at: string | null
          attendance_marked_by: string | null
          attended: boolean | null
          created_at: string
          id: string
          meeting_id: string
          role: string
          user_id: string
        }
        Insert: {
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          attended?: boolean | null
          created_at?: string
          id?: string
          meeting_id: string
          role?: string
          user_id: string
        }
        Update: {
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          attended?: boolean | null
          created_at?: string
          id?: string
          meeting_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_attendance_marked_by_fkey"
            columns: ["attendance_marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          company_id: string
          created_at: string
          date: string
          description: string | null
          duration: number | null
          id: string
          location: string | null
          meeting_type: string | null
          meeting_url: string | null
          organizer_id: string
          status: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date: string
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_type?: string | null
          meeting_url?: string | null
          organizer_id: string
          status?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date?: string
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_type?: string | null
          meeting_url?: string | null
          organizer_id?: string
          status?: string | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          company_id: string | null
          contact_person: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          enrollment_id: string
          id: string
          payment_date: string | null
          status: string
          student_id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          enrollment_id: string
          id?: string
          payment_date?: string | null
          status?: string
          student_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          enrollment_id?: string
          id?: string
          payment_date?: string | null
          status?: string
          student_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_columns: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_protected: boolean
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_protected?: boolean
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_protected?: boolean
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_columns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_columns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_super_admin: boolean | null
          role_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_super_admin?: boolean | null
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["schedule_block_type"]
          company_id: string
          created_at: string
          created_by: string
          end_date: string | null
          end_time: string | null
          id: string
          is_recurring: boolean
          reason: string | null
          recurring_pattern: Json | null
          start_date: string
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_type?: Database["public"]["Enums"]["schedule_block_type"]
          company_id: string
          created_at?: string
          created_by: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          reason?: string | null
          recurring_pattern?: Json | null
          start_date: string
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["schedule_block_type"]
          company_id?: string
          created_at?: string
          created_by?: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          reason?: string | null
          recurring_pattern?: Json | null
          start_date?: string
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      script_attachments: {
        Row: {
          created_at: string
          created_by: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          script_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          script_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          script_id?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      scripts: {
        Row: {
          category: string | null
          company_id: string
          content: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          content: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_proof_url: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          birth_date: string | null
          course_id: string | null
          cpf: string
          cpf_document_url: string | null
          created_at: string
          documents_status: Json | null
          email: string
          enrollment_date: string
          enrollment_number: string
          id: string
          institution_id: string
          name: string
          origin: string | null
          partner_id: string | null
          payment_proof_url: string | null
          phone: string | null
          photo_url: string | null
          rg_document_url: string | null
          rg_issuer: string | null
          rg_number: string | null
          rg_state: string | null
          school_certificate_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_proof_url?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          birth_date?: string | null
          course_id?: string | null
          cpf: string
          cpf_document_url?: string | null
          created_at?: string
          documents_status?: Json | null
          email: string
          enrollment_date?: string
          enrollment_number: string
          id?: string
          institution_id: string
          name: string
          origin?: string | null
          partner_id?: string | null
          payment_proof_url?: string | null
          phone?: string | null
          photo_url?: string | null
          rg_document_url?: string | null
          rg_issuer?: string | null
          rg_number?: string | null
          rg_state?: string | null
          school_certificate_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_proof_url?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          birth_date?: string | null
          course_id?: string | null
          cpf?: string
          cpf_document_url?: string | null
          created_at?: string
          documents_status?: Json | null
          email?: string
          enrollment_date?: string
          enrollment_number?: string
          id?: string
          institution_id?: string
          name?: string
          origin?: string | null
          partner_id?: string | null
          payment_proof_url?: string | null
          phone?: string | null
          photo_url?: string | null
          rg_document_url?: string | null
          rg_issuer?: string | null
          rg_number?: string | null
          rg_state?: string | null
          school_certificate_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          current_value: number
          goal_type: string
          id: string
          period: string
          status: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          current_value?: number
          goal_type: string
          id?: string
          period?: string
          status?: string
          target_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          current_value?: number
          goal_type?: string
          id?: string
          period?: string
          status?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          company_id: string
          created_at: string
          id: string
          lead_id: string | null
          name: string | null
          phone: string | null
          profile_picture_url: string | null
          updated_at: string
          whatsapp_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          whatsapp_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          whatsapp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversation_tag_assignments: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversation_tag_assignments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversation_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lead_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          assigned_to: string | null
          company_id: string
          contact_id: string
          created_at: string
          id: string
          instance_id: string
          last_message: string | null
          last_message_at: string | null
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          contact_id: string
          created_at?: string
          id?: string
          instance_id: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          instance_id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          company_id: string
          created_at: string
          id: string
          instance_name: string
          instance_token: string | null
          phone_number: string | null
          qr_code: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          instance_name: string
          instance_token?: string | null
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          instance_name?: string
          instance_token?: string | null
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          company_id: string
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          media_mimetype: string | null
          media_url: string | null
          message_type: string
          sender_name: string | null
          sent_by: string | null
          status: string
          whatsapp_message_id: string | null
        }
        Insert: {
          company_id: string
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          media_mimetype?: string | null
          media_url?: string | null
          message_type?: string
          sender_name?: string | null
          sent_by?: string | null
          status?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          company_id?: string
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          media_mimetype?: string | null
          media_url?: string | null
          message_type?: string
          sender_name?: string | null
          sent_by?: string | null
          status?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_companies_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_companies_view: {
        Row: {
          appointments_count: number | null
          created_at: string | null
          domain: string | null
          id: string | null
          industry: string | null
          leads_count: number | null
          location: string | null
          name: string | null
          phone: string | null
          plan: string | null
          size: string | null
          status: string | null
          updated_at: string | null
          user_count: number | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_default_pipeline_columns: {
        Args: { target_company_id: string }
        Returns: undefined
      }
      create_default_roles_for_company: {
        Args: { target_company_id: string }
        Returns: undefined
      }
      get_advanced_saas_analytics:
        | {
            Args: { company_filter?: string; period_days?: number }
            Returns: Json
          }
        | {
            Args: never
            Returns: {
              active_companies: number
              total_appointments: number
              total_companies: number
              total_leads: number
              total_users: number
            }[]
          }
      get_current_user_company_id: { Args: never; Returns: string }
      get_current_user_info: {
        Args: never
        Returns: {
          company_id: string
          company_name: string
          email: string
          full_name: string
          has_company: boolean
          role_name: string
          user_id: string
        }[]
      }
      get_saas_metrics: {
        Args: never
        Returns: {
          active_companies: number
          total_appointments: number
          total_companies: number
          total_leads: number
          total_users: number
        }[]
      }
      increment_unread_count: {
        Args: { conversation_uuid: string }
        Returns: undefined
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_saas_admin: { Args: never; Returns: boolean }
      is_saas_admin_for_company_management: { Args: never; Returns: boolean }
      setup_company_admin: {
        Args: { company_id: string; user_id: string }
        Returns: undefined
      }
      sync_appointment_status_with_pipeline: { Args: never; Returns: undefined }
      update_goal_progress: { Args: never; Returns: undefined }
      user_has_permission: {
        Args: { permission_path: string }
        Returns: boolean
      }
    }
    Enums: {
      schedule_block_type: "time_slot" | "full_day"
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
      schedule_block_type: ["time_slot", "full_day"],
    },
  },
} as const
