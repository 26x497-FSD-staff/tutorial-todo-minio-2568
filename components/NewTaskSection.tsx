import { AddTaskErrorResponse, AddTaskOKResponse } from "@/app/api/task/route";
import { Button, FileInput, Flex, Paper, TextInput } from "@mantine/core";
import axios from "axios";
import { FC, useState } from "react";

type Props = {
  refetchTasks: Function;
};

export const NewTaskSection: FC<Props> = ({ refetchTasks }) => {
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function callAddTaskApi() {
    if (!title) return;
    //We're post with Content-Type : "multipart/form-data"
    //We're not posting with Content-Type : "application/json"

    const formData = new FormData();
    formData.set("title", title);
    if (file) formData.set("file", file as Blob);

    try {
      setLoading(true);
      const result = await axios.post<{}, AddTaskOKResponse, FormData>(
        "/api/task",
        formData
      );
      setTitle("");
      setFile(null);
      refetchTasks();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response?.data as AddTaskErrorResponse;
        console.log(data);
        alert(data.message);
      }
    }
    setLoading(false);
  }

  return (
    <Paper p="md" withBorder>
      <Flex align="flex-end" gap="sm">
        <TextInput
          label="Add Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add Task..."
        />
        <FileInput
          label="Image (optional)"
          placeholder="Attach Image.."
          w="150px"
          accept="image/*"
          value={file}
          onChange={setFile}
          clearable
        />
        <Button onClick={callAddTaskApi} disabled={loading}>
          {loading ? "Adding.." : "Add Task"}
        </Button>
      </Flex>
    </Paper>
  );
};
