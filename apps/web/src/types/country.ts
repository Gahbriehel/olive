export interface Country {
  name: string;
  phone_code: string;
  code?: string;
  flag?: string;
  currency?: string;
  capital?: string;
  states?: State[];
}

export interface State {
  name: string;
  cities?: City[];
}

export interface City {
  name: string;
}
