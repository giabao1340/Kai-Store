import { Injectable} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}// JwtAuthGuard kế thừa từ AuthGuard của Passport, với strategy là 'jwt' đã được định nghĩa trong JwtStrategy