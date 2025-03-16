import "next-auth";
import { role_type } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: role_type;
    } & import("next-auth").DefaultSession["user"];
  }

  interface User {
    id: string;
    role: role_type;
  }

  interface JWT {
    id?: string;
    role?: role_type;
  }
}