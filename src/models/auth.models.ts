export interface AuthDTO {
  createUserResponse: CreateUserResponseDTO;
};

type CreateUserResponseDTO = {
  uid?: string | undefined,
  code?: string | undefined,
  message?: string | undefined
};
