export interface SessionData {
  lastCheck: number; // epoch ms
  isValid: boolean;
  token: string;
}
