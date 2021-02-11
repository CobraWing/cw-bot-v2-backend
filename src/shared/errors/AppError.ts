interface IAppError {
  message: string;
  message_ptbr?: string;
  statusCode?: number;
}

class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  public readonly message_ptbr?: string;

  constructor({ message, statusCode = 400, message_ptbr = '' }: IAppError) {
    this.message = message;
    this.statusCode = statusCode;
    this.message_ptbr = message_ptbr;
  }
}

export default AppError;
