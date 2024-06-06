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
          wikiDataId: string | null
        }
        Insert: {
          country_id?: number | null
          id: number
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          state_id?: number | null
          wikiDataId?: string | null
        }
        Update: {
          country_id?: number | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          state_id?: number | null
          wikiDataId?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
