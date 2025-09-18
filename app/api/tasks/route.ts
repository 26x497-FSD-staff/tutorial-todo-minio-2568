import { checkAuth } from "@/libs/checkAuth";
import { getMinio } from "@/libs/getMinio";
import { getPrisma } from "@/libs/getPrisma";
import { Task } from "@prisma/client";
import { writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import * as os from "os";

export type AddTaskBody = {
  title: string;
  file: File | null;
};

export type AddTaskOKResponse = { ok: true };
export type AddTaskErrorResponse = { ok: false; message: string };

export async function POST(req: Request) {
  const username = checkAuth();
  if (!username)
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 400 }
    );

  //read data from request
  const data = await req.formData();
  const title = data.get("title") as string;
  const file: File | null = data.get("file") as unknown as File;

  let fileName: string | null = null;
  if (file !== null) {
    //write file in temp folder of the system
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileTempPath = os.tmpdir() + "/" + file.name;
    await writeFile(fileTempPath, buffer);

    //random new filename
    const fileExtension = fileTempPath.split(".").at(-1);
    const newFileName = `${nanoid()}.${fileExtension}`;
    fileName = newFileName;

    const minio = getMinio();

    try {
      const saveMinioResult = await minio.fPutObject(
        process.env.OBJ_BUCKET as string,
        `${username}/${newFileName}`,
        fileTempPath
      );
    } catch (err) {
      console.log(err);

      return NextResponse.json<AddTaskErrorResponse>(
        {
          ok: false,
          message: "Oops. Please try again later",
        },
        { status: 500 }
      );
    }
  }

  const prisma = getPrisma();
  try {
    await prisma.task.create({
      data: {
        title,
        fileName,
        ownerUsername: username,
      },
    });
    return NextResponse.json<AddTaskOKResponse>({ ok: true });
  } catch {
    return NextResponse.json<AddTaskErrorResponse>(
      {
        ok: false,
        message: "Oops. Please try again later",
      },
      { status: 500 }
    );
  }
}

export type GetTasksResponse =
  | {
      ok: true;
      tasks: Task[];
    }
  | { ok: false; message: string };

export async function GET(req: Request) {
  const username = checkAuth();
  if (!username)
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 400 }
    );
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      ownerUsername: username,
    },
  });
  return NextResponse.json<GetTasksResponse>({ ok: true, tasks });
}

export type DeleteTaskBody = {
  id: number;
};
export type DeleteTaskOKResponse = { ok: true };
export type DeleteTaskErrorResponse = { ok: false; message: string };

export async function DELETE(req: Request) {
  const prisma = getPrisma();
  const body = (await req.json()) as DeleteTaskBody;
  const id = body.id;
  try {
    const result = await prisma.task.delete({
      where: {
        id,
      },
    });
    return NextResponse.json<DeleteTaskOKResponse>({ ok: true });
  } catch {
    return NextResponse.json<DeleteTaskErrorResponse>(
      {
        ok: false,
        message: "Task does not exist",
      },
      {
        status: 404,
      }
    );
  }
}
