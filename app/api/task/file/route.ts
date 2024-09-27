import { checkAuth } from "@/libs/checkAuth";
import { getMinio } from "@/libs/getMinio";
import { getPrisma } from "@/libs/getPrisma";
import { NextRequest, NextResponse } from "next/server";

export type GetTaskFileOKResponse = { ok: true; url: string };
export type GetTaskFileErrorResponse = { ok: false; message: string };

export async function GET(req: NextRequest) {
  const username = checkAuth();
  if (!username)
    return NextResponse.json<GetTaskFileErrorResponse>(
      { ok: false, message: "Unauthorized" },
      { status: 400 }
    );

  const taskId = Number(req.nextUrl.searchParams.get("taskId") as string);

  const prisma = getPrisma();
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      ownerUsername: username,
      fileName: { not: null },
    },
  });

  if (!task) {
    return NextResponse.json<GetTaskFileErrorResponse>(
      { ok: false, message: "Task is not found" },
      { status: 404 }
    );
  }

  const minio = getMinio();
  try {
    const url = await minio.presignedGetObject(
      process.env.OBJ_BUCKET as string,
      `${username}/${task.fileName}`,
      5 * 60
    );

    console.log("\n" + url + "\n");
    return NextResponse.json<GetTaskFileOKResponse>({ ok: true, url });
  } catch {
    return NextResponse.json<GetTaskFileErrorResponse>(
      {
        ok: false,
        message: "Oops. Please try again later",
      },
      { status: 500 }
    );
  }
}
