"use client";
import { GetTasksResponse } from "@/app/api/task/route";
import { NewTaskSection } from "@/components/NewTaskSection";
import { TaskCard } from "@/components/TaskCard";
import { Anchor, Container, Group, Text, Title } from "@mantine/core";
import { Task } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

type Props = {
  username: string;
};

export const MyTaskSection: FC<Props> = ({ username }) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  function loadTasks() {
    axios
      .get<GetTasksResponse>("/api/task")
      .then((resp) => {
        if (resp.data.ok) {
          setTasks(resp.data.tasks);
        }
      })
      .catch((err) => {});
  }

  useEffect(() => {
    router.refresh();
    loadTasks();
  }, []);

  async function callLogout() {
    await axios.delete("/api/auth");
    router.push("/");
  }

  return (
    <Container size="xs">
      <Group position="apart">
        <Title italic>Todolist</Title>
        <Group>
          <Text>Hi, {username}</Text>
          <Anchor color="red" onClick={callLogout}>
            Logout
          </Anchor>
        </Group>
      </Group>
      <NewTaskSection refetchTasks={loadTasks} />
      {tasks.map((task) => (
        <TaskCard
          id={task.id}
          title={task.title}
          fileName={task.fileName}
          key={task.id}
          refetchTasks={loadTasks}
        />
      ))}
    </Container>
  );
};
