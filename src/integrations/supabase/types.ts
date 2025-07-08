export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      facebook_ads: {
        Row: {
          alcance: number | null
          anuncio: string | null
          campanha: string
          cliente_nome: string | null
          cliques_no_link: number | null
          conjunto_anuncio: string
          data: string
          frequencia: number | null
          id_conta: number | null
          id_data: string
          impressoes: number | null
          investimento: number | null
          mensagens_iniciadas: number | null
          numero_vis_25_videoview: number | null
          numero_vis_3s_videoview: number | null
          numero_vis_50_videoview: number | null
          numero_vis_75_videoview: number | null
          numero_vis_95_videoview: number | null
          source_id: string | null
        }
        Insert: {
          alcance?: number | null
          anuncio?: string | null
          campanha: string
          cliente_nome?: string | null
          cliques_no_link?: number | null
          conjunto_anuncio: string
          data: string
          frequencia?: number | null
          id_conta?: number | null
          id_data: string
          impressoes?: number | null
          investimento?: number | null
          mensagens_iniciadas?: number | null
          numero_vis_25_videoview?: number | null
          numero_vis_3s_videoview?: number | null
          numero_vis_50_videoview?: number | null
          numero_vis_75_videoview?: number | null
          numero_vis_95_videoview?: number | null
          source_id?: string | null
        }
        Update: {
          alcance?: number | null
          anuncio?: string | null
          campanha?: string
          cliente_nome?: string | null
          cliques_no_link?: number | null
          conjunto_anuncio?: string
          data?: string
          frequencia?: number | null
          id_conta?: number | null
          id_data?: string
          impressoes?: number | null
          investimento?: number | null
          mensagens_iniciadas?: number | null
          numero_vis_25_videoview?: number | null
          numero_vis_3s_videoview?: number | null
          numero_vis_50_videoview?: number | null
          numero_vis_75_videoview?: number | null
          numero_vis_95_videoview?: number | null
          source_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_clients: {
        Row: {
          cliente_nome: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          cliente_nome: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          cliente_nome?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_anuncio: {
        Row: {
          cidade: string | null
          cliente_nome: string | null
          contact_id: string | null
          cta: string | null
          ctwaclid: string | null
          data_criacao: string
          email: string | null
          estado: string | null
          id_transacao: string | null
          mensagem: string | null
          moeda: string | null
          nome: string | null
          nome_anuncio: string | null
          nome_campanha: string | null
          nome_conjunto: string | null
          pais: string | null
          plataforma: string | null
          processado: string | null
          sobrenome: string | null
          source_id: string | null
          source_url: string | null
          status: string | null
          telefone: string
          valor_venda: number | null
        }
        Insert: {
          cidade?: string | null
          cliente_nome?: string | null
          contact_id?: string | null
          cta?: string | null
          ctwaclid?: string | null
          data_criacao: string
          email?: string | null
          estado?: string | null
          id_transacao?: string | null
          mensagem?: string | null
          moeda?: string | null
          nome?: string | null
          nome_anuncio?: string | null
          nome_campanha?: string | null
          nome_conjunto?: string | null
          pais?: string | null
          plataforma?: string | null
          processado?: string | null
          sobrenome?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          telefone: string
          valor_venda?: number | null
        }
        Update: {
          cidade?: string | null
          cliente_nome?: string | null
          contact_id?: string | null
          cta?: string | null
          ctwaclid?: string | null
          data_criacao?: string
          email?: string | null
          estado?: string | null
          id_transacao?: string | null
          mensagem?: string | null
          moeda?: string | null
          nome?: string | null
          nome_anuncio?: string | null
          nome_campanha?: string | null
          nome_conjunto?: string | null
          pais?: string | null
          plataforma?: string | null
          processado?: string | null
          sobrenome?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          telefone?: string
          valor_venda?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fix_date_format: {
        Args: { input_date: string }
        Returns: string
      }
      get_user_clients: {
        Args: { user_id: string }
        Returns: string[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
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
