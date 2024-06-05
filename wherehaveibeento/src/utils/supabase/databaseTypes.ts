export type Country = {
    id: number;
    name: string;
    iso3: string | null;
    iso2: string | null;
    numeric_code: number | null;
    phone_code: string | null;
    capital: string | null;
    currency: string | null;
    currency_name: string | null;
    currency_symbol: string | null;
    tld: string | null;
    native: string | null;
    region: string | null;
    region_id: number | null;
    subregion: string | null;
    subregion_id: number | null;
    nationality: string | null;
    timezones: string | null;
    latitude: number | null;
    longitude: number | null;
    emoji: string | null;
    emojiU: string | null;
  };
  
  export type City = {
    id: number;
    name: string;
    state_id: number | null;
    country_id: number | null;
    latitude: number | null;
    longitude: number | null;
    wikiDataId: string | null;
  };