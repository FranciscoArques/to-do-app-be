export interface AuthDTO {
  createUserResponse: CreateUserResponseDTO;
  loginUserResponseDTO: LoginUserResponseDTO;
}

type CreateUserResponseDTO = {
  uid: string | undefined;
};

type LoginUserResponseDTO = {
  iv: string;
  userToken: string;
};
