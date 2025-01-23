import { LoginForm } from "@/components/forms/LoginForm";
import { headers } from "next/headers";
import React from "react";

async function LoginPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  return <LoginForm referer={referer} />;
}

export default LoginPage;
