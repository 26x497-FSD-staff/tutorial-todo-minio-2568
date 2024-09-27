import { getPrisma } from "@/libs/getPrisma";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type LoginBody = {
  username: string;
  password: string;
};

export type LoginOKResponse = { ok: true; username: string };
export type LoginErrorResponse = { ok: false; message: string };

//this is login route
export async function POST(req: Request) {
  const body = (await req.json()) as LoginBody;
  const { username, password } = body;

  const prisma = getPrisma();
  const user = await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  });
  if (user) {
    //create credential
    const token = jwt.sign({ username }, process.env.JWT_SECRET as string);
    cookies().set({
      name: "PRISMA-MINIO-TOKEN",
      value: token,
      httpOnly: true,
      path: "/",
      //secure: true  (only turn this on in production)
    });

    return NextResponse.json<LoginOKResponse>({ ok: true, username });
  } else {
    return NextResponse.json<LoginErrorResponse>(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  }
}

//this is logout route
export async function DELETE() {
  cookies().delete("PRISMA-MINIO-TOKEN");
  return NextResponse.json({ ok: true });
}
