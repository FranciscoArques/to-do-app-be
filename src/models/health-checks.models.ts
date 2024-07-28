import type { DocumentData } from 'firebase/firestore';

export interface HealthCheckDTO {
  pingResponse: PingResponseDTO;
  pingDbResponse: PingDbResponseDTO;
}

type PingResponseDTO = {
  message: string;
};

type PingDbResponseDTO = {
  result?: DocumentData;
  error?: boolean;
  code?: number;
  message?: string;
};
