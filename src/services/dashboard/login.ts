import jwt, { JwtPayload } from "jsonwebtoken"
import bcrypt from "bcrypt"
import { procurarUsuario } from "../../infra/dataBase/user"

interface TokenPayload extends JwtPayload {
    role: string
}

const JWT_SECRET = `${process.env.JWT_SECRET}`;

export async function login(email: string, password: string) {
    try {
        const getUser = await procurarUsuario(email)

        if (!getUser || !getUser.password) {
            return {
                status: 401,
                sub: undefined,
                role: undefined,
                access_token: undefined,
                error: "Credenciais inválidas ou usuário não existe."
            }
        }

        const passwordMatch = await bcrypt.compare(
            password,
            getUser.password
        )

        if (!passwordMatch) {
            return {
                status: 401,
                sub: undefined,
                role: undefined,
                access_token: undefined,
                error: "Credenciais inválidas."
            }
        }

        const token = jwt.sign(
            { role: getUser.role },
            JWT_SECRET,
            {
                subject: String(getUser.id),
                expiresIn: "1m"
            }
        )

        return {
            status: 200,
            sub: getUser.id,
            role: getUser.role,
            access_token: token,
            error: undefined
        }

    } catch (e: any) {
        return {
            status: 500,
            sub: undefined,
            role: undefined,
            access_token: undefined,
            error: e.message ?? e
        }
    }
}


export function validarToken(token: string | undefined) {
    try {
        if (!token) {
            return {
                status: 401,
                sub: undefined,
                role: undefined,
                error: "Token não passado"
            }
        }

        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

        return {
            status: 200,
            sub: decoded.sub,
            role: decoded.role
        }

    } catch {
        return {
            status: 401,
            sub: undefined,
            role: undefined,
            error: "Token inválido ou expirado"
        }
    }
}
