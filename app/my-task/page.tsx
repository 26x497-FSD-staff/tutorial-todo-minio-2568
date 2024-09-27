import { MantineWrapper } from "@/components/MantineWrapper";
import { MyTaskSection } from "@/components/MyTaskSection";
import { checkAuth } from "@/libs/checkAuth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MyTasksPage() {
  const username = checkAuth();

  if (!username) {
    redirect("/");
  }

  return (
    <MantineWrapper>
      <MyTaskSection username={username} />
    </MantineWrapper>
  );
}
