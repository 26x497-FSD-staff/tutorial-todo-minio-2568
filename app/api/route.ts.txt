import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import * as os from "os";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  //todo research (node:5608) ExperimentalWarning: buffer.File is an experimental feature and might change at any time
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ ok: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileTempPath = os.tmpdir() + "/" + file.name;
  await writeFile(fileTempPath, buffer);

  minioClient.fPutObject(
    "test-minio",
    file.name,
    fileTempPath,
    {},
    (error, result) => {
      console.log(error, result);
    }
  );

  minioClient.presignedGetObject(
    "test-minio",
    file.name,
    24 * 60 * 60,
    function (err, presignedUrl) {
      if (err) return console.log(err);
      console.log(presignedUrl);
    }
  );

  return NextResponse.json({});
}
