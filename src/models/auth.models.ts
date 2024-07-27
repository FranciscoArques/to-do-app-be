import { UserCredential } from 'firebase/auth';

export interface AuthDTO {
  createUserResponse: CreateUserResponseDTO;
  loginUserResponseDTO: LoginUserResponseDTO;
}

type CreateUserResponseDTO = {
  uid?: string | undefined;
  error?: boolean;
  code?: number | undefined;
  message?: string | undefined;
};

type LoginUserResponseDTO = {
  login?: UserCredential;
  userToken?: string;
  error?: boolean;
  code?: number | undefined;
  message?: string | undefined;
};
