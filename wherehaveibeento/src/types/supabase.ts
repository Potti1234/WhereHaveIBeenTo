export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      city: {
        Row: {
          country_id: number | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string | null
          state_id: number | null
          unaccent_name: string | null
          wikiDataId: string | null
        }
        Insert: {
          country_id?: number | null
          id: number
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          state_id?: number | null
          unaccent_name?: string | null
          wikiDataId?: string | null
        }
        Update: {
          country_id?: number | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          state_id?: number | null
          unaccent_name?: string | null
          wikiDataId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state"
            referencedColumns: ["id"]
          },
        ]
      }
      country: {
        Row: {
          capital: string | null
          currency: string | null
          currency_name: string | null
          currency_symbol: string | null
          emoji: string | null
          emojiU: string | null
          id: number
          iso2: string | null
          iso3: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          nationality: string | null
          native: string | null
          numeric_code: number | null
          phone_code: string | null
          region: string | null
          region_id: number | null
          subregion: string | null
          subregion_id: number | null
          timezones: string | null
          tld: string | null
        }
        Insert: {
          capital?: string | null
          currency?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          emoji?: string | null
          emojiU?: string | null
          id: number
          iso2?: string | null
          iso3?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          nationality?: string | null
          native?: string | null
          numeric_code?: number | null
          phone_code?: string | null
          region?: string | null
          region_id?: number | null
          subregion?: string | null
          subregion_id?: number | null
          timezones?: string | null
          tld?: string | null
        }
        Update: {
          capital?: string | null
          currency?: string | null
          currency_name?: string | null
          currency_symbol?: string | null
          emoji?: string | null
          emojiU?: string | null
          id?: number
          iso2?: string | null
          iso3?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          nationality?: string | null
          native?: string | null
          numeric_code?: number | null
          phone_code?: string | null
          region?: string | null
          region_id?: number | null
          subregion?: string | null
          subregion_id?: number | null
          timezones?: string | null
          tld?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          profile_picture_url: string | null
        }
        Insert: {
          id: string
          profile_picture_url?: string | null
        }
        Update: {
          id?: string
          profile_picture_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      state: {
        Row: {
          country_id: number | null
          id: number
          name: string | null
          state_code: string | null
          type: string | null
        }
        Insert: {
          country_id?: number | null
          id: number
          name?: string | null
          state_code?: string | null
          type?: string | null
        }
        Update: {
          country_id?: number | null
          id?: number
          name?: string | null
          state_code?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
        ]
      }
      visited_city: {
        Row: {
          city_id: number | null
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          city_id?: number | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          city_id?: number | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visited_city_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visited_city_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      distinct_visited_countries: {
        Row: {
          iso2: string | null
          name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visited_city_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distinct_visited_states: {
        Row: {
          country_name: string | null
          name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visited_city_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_20_random_countries: {
        Args: Record<PropertyKey, never>
        Returns: {
          capital: string | null
          currency: string | null
          currency_name: string | null
          currency_symbol: string | null
          emoji: string | null
          emojiU: string | null
          id: number
          iso2: string | null
          iso3: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          nationality: string | null
          native: string | null
          numeric_code: number | null
          phone_code: string | null
          region: string | null
          region_id: number | null
          subregion: string | null
          subregion_id: number | null
          timezones: string | null
          tld: string | null
        }[]
      }
      get_random_cities: {
        Args: {
          amount: number
        }
        Returns: {
          country_id: number | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string | null
          state_id: number | null
          unaccent_name: string | null
          wikiDataId: string | null
        }[]
      }
      get_random_countries: {
        Args: {
          amount: number
        }
        Returns: {
          capital: string | null
          currency: string | null
          currency_name: string | null
          currency_symbol: string | null
          emoji: string | null
          emojiU: string | null
          id: number
          iso2: string | null
          iso3: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          nationality: string | null
          native: string | null
          numeric_code: number | null
          phone_code: string | null
          region: string | null
          region_id: number | null
          subregion: string | null
          subregion_id: number | null
          timezones: string | null
          tld: string | null
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
