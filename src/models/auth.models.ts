export interface AuthDTO {
  createUserResponse: CreateUserResponseDTO;
  loginUserResponseDTO: LoginUserResponseDTO;
  disableUserResponseDTO: DisableUserResponseDTO;
  deleteUserResponseDTO: DeleteUserResponseDTO;
  enabledUserResponseDTO: EnabledUserResponseDTO;
  restoreUserResponseDTO: RestoreUserResponseDTO;
  deleteAdminResponseDTO: DeleteAdminResponseDTO;
  emailChangePasswordResponseDTO: EmailChangePasswordResponseDTO;
  changePasswordResponseDTO: ChangePasswordResponseDTO;
}

type CreateUserResponseDTO = {
  uid: string | undefined;
};

type LoginUserResponseDTO = {
  iv: string;
  userToken: string;
};

type EmailChangePasswordResponseDTO = {
  message: 'email sent';
  userToken: string;
};

type ChangePasswordResponseDTO = {
  message: 'password successfully changed';
};

type DisableUserResponseDTO = {
  message: 'user is now disabled';
};

type EnabledUserResponseDTO = {
  message: 'user is now enabled';
};

type DeleteUserResponseDTO = {
  message: 'user is now deleted';
};

type RestoreUserResponseDTO = {
  message: 'user is now restored';
};

type DeleteAdminResponseDTO = {
  message: 'users in db deleted permanently';
  usersDeleted: number;
};
