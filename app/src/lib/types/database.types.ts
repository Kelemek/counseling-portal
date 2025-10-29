export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'counselor' | 'counselee'
export type AssignmentStatus = 'pending' | 'active' | 'completed' | 'archived'
export type HomeworkStatus = 'assigned' | 'in_progress' | 'completed' | 'reviewed'
export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          metadata: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          metadata?: Json
        }
      }
      counselor_profiles: {
        Row: {
          id: string
          user_id: string
          specialties: string[] | null
          bio: string | null
          max_counselees: number
          is_accepting_new: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialties?: string[] | null
          bio?: string | null
          max_counselees?: number
          is_accepting_new?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialties?: string[] | null
          bio?: string | null
          max_counselees?: number
          is_accepting_new?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      counselee_profiles: {
        Row: {
          id: string
          user_id: string
          intake_form_id: string | null
          assigned_counselor_id: string | null
          assignment_status: AssignmentStatus
          assigned_at: string | null
          first_session_date: string | null
          notes: string | null
          emergency_contact: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intake_form_id?: string | null
          assigned_counselor_id?: string | null
          assignment_status?: AssignmentStatus
          assigned_at?: string | null
          first_session_date?: string | null
          notes?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          intake_form_id?: string | null
          assigned_counselor_id?: string | null
          assignment_status?: AssignmentStatus
          assigned_at?: string | null
          first_session_date?: string | null
          notes?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      form_assignments: {
        Row: {
          id: string
          intake_form_id: string
          counselor_id: string
          counselee_id: string | null
          assigned_by: string
          status: AssignmentStatus
          notes: string | null
          assigned_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          intake_form_id: string
          counselor_id: string
          counselee_id?: string | null
          assigned_by: string
          status?: AssignmentStatus
          notes?: string | null
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          intake_form_id?: string
          counselor_id?: string
          counselee_id?: string | null
          assigned_by?: string
          status?: AssignmentStatus
          notes?: string | null
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      homework: {
        Row: {
          id: string
          counselee_id: string
          counselor_id: string
          title: string
          description: string | null
          content: string | null
          due_date: string | null
          status: HomeworkStatus
          file_urls: string[] | null
          submission_text: string | null
          submitted_at: string | null
          reviewed_at: string | null
          counselor_feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          counselee_id: string
          counselor_id: string
          title: string
          description?: string | null
          content?: string | null
          due_date?: string | null
          status?: HomeworkStatus
          file_urls?: string[] | null
          submission_text?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          counselor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          counselee_id?: string
          counselor_id?: string
          title?: string
          description?: string | null
          content?: string | null
          due_date?: string | null
          status?: HomeworkStatus
          file_urls?: string[] | null
          submission_text?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          counselor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          counselee_id: string
          counselor_id: string
          sender_id: string
          content: string
          status: MessageStatus
          read_at: string | null
          attachment_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          counselee_id: string
          counselor_id: string
          sender_id: string
          content: string
          status?: MessageStatus
          read_at?: string | null
          attachment_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          counselee_id?: string
          counselor_id?: string
          sender_id?: string
          content?: string
          status?: MessageStatus
          read_at?: string | null
          attachment_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      jotform_submissions: {
        Row: {
          id: string
          form_id: string | null
          submission_id: string | null
          submitted_at: string
          data: Json
          parsed: Json | null
          files: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          form_id?: string | null
          submission_id?: string | null
          submitted_at?: string
          data: Json
          parsed?: Json | null
          files?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string | null
          submission_id?: string | null
          submitted_at?: string
          data?: Json
          parsed?: Json | null
          files?: Json | null
          created_at?: string
        }
      }
    }
  }
}
