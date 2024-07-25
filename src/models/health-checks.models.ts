import type { DocumentData } from "firebase/firestore";

export interface HealthCheckDTO {
  pingResponse: PingResponseDTO;
  pingDbResponse: PingDbResponseDTO;
}

type PingResponseDTO = {
  message: string
  code?: number,
};

type PingDbResponseDTO = DocumentData;
