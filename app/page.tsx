import { LoginSection } from "@/components/LoginSection";
import { MantineWrapper } from "@/components/MantineWrapper";
import { checkAuth } from "@/libs/checkAuth";
import { redirect } from "next/navigation";

//this is server component!
export default function LoginPage() {
  const username = checkAuth();
  if (username) {
    redirect("/my-task");
  }

  return (
    <MantineWrapper>
      <LoginSection />
    </MantineWrapper>
  );
}
