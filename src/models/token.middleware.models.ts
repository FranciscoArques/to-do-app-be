export interface TokenMiddlewareDTO {
  getTokenResponseDTO: GetTokenResponseDTO;
  registerTokenResponseDTO: RegisterTokenResponseDTO;
  disableTokenResponseDTO: DisableTokenResponseDTO;
  enableTokenResponseDTO: enableTokenResponseDTO;
  deleteTokenResponseDTO: DeleteTokenResponseDTO;
}

export type DecodedToken = {
  encryptedData: string;
};

type GetTokenResponseDTO = {
  token: string;
};

type RegisterTokenResponseDTO = {
  message: 'token created';
  tokenUid: string;
};

type DisableTokenResponseDTO = {
  message: 'token is now disabled';
};

type enableTokenResponseDTO = {
  message: 'token is now enabled';
};

type DeleteTokenResponseDTO = {
  message: 'tokens in db deleted permanently';
  tokensDeleted: number;
};
