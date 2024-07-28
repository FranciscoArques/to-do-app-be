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
  iv?: string,
  userToken?: string;
  error?: boolean;
  code?: number | undefined;
  message?: string | undefined;
};
