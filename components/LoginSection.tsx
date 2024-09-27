"use client";

import {
  LoginBody,
  LoginErrorResponse,
  LoginOKResponse,
} from "@/app/api/auth/route";
import { Button, Container, Stack, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

export const LoginSection: FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function callLoginApi() {
    try {
      await axios.post<{}, LoginOKResponse, LoginBody>("/api/auth", {
        username,
        password,
      });
      router.push("/my-task");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response?.data as LoginErrorResponse;
        alert(data.message);
      }
    }
  }

  return (
    <Container size="xs">
      <Title italic>Todolist</Title>
      <Stack>
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={callLoginApi}>Login</Button>
      </Stack>
    </Container>
  );
};
