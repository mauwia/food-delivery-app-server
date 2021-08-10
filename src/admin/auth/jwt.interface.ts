export interface Jwt {
  token: string;
}

export interface JwtPayload {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  role: string,
}
