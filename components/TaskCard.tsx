import {
  GetTaskFileErrorResponse,
  GetTaskFileOKResponse,
} from "@/app/api/task/file/route";
import {
  DeleteTaskBody,
  DeleteTaskErrorResponse,
  DeleteTaskOKResponse,
} from "@/app/api/task/route";
import { Button, Group, Paper, Text, Modal, Image } from "@mantine/core";
import { Task } from "@prisma/client";
import axios from "axios";
import { FC, useState } from "react";

import { useDisclosure } from "@mantine/hooks";

type Props = Pick<Task, "title" | "id" | "fileName"> & {
  refetchTasks: Function;
};

export const TaskCard: FC<Props> = ({ title, id, fileName, refetchTasks }) => {
  const [url, setUrl] = useState("");
  const [opened, setOpened] = useState(false);
  // const [opened, { open, close }] = useDisclosure(false);

  async function callDeleteTask() {
    try {
      axios.delete<{}, DeleteTaskOKResponse, DeleteTaskBody>("/api/task", {
        data: { id },
      });
      refetchTasks();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response?.data as DeleteTaskErrorResponse;
        alert(data.message);
      }
    }
  }

  async function callGetTaskFile() {
    try {
      const response = await axios.get<GetTaskFileOKResponse>(
        `/api/task/file?taskId=${id}`
      );

      console.log(response.data.url);
      setUrl(response.data.url);
      setOpened(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response?.data as GetTaskFileErrorResponse;
        alert(data.message);
      }
    }
  }

  return (
    <Paper withBorder my="xs" p="md">
      <Group position="apart">
        <Text>{title}</Text>
        <Modal
          size="65%"
          opened={opened}
          onClose={() => setOpened(false)}
          title={title + " photo"}
        >
          <Image radius="md" src={url} />
        </Modal>
        <Group>
          {fileName && (
            <Button color="gray" variant="outline" onClick={callGetTaskFile}>
              View file
            </Button>
          )}

          <Button color="red" variant="outline" onClick={callDeleteTask}>
            Delete
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};
