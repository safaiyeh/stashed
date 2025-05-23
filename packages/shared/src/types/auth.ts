export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthMessage {
  type: 'STASHED_AUTH';
  session: Session;
} 