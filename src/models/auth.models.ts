import { UserCredential } from 'firebase/auth';

export interface AuthDTO {
  createUserResponse: CreateUserResponseDTO;
  loginUserResponseDTO: LoginUserResponseDTO;
}

type CreateUserResponseDTO = {
  uid?: string | undefined;
  code?: number | undefined;
  message?: string | undefined;
};

type LoginUserResponseDTO = {
  login?: UserCredential;
  code?: number | undefined;
  message?: string | undefined;
};
