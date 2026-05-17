import { LoginForm } from "@/components/forms/LoginForm";
import { Metadata } from "next";
import { headers } from "next/headers";
import React from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your NYIG Tengen account.",
};

async function LoginPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  return <LoginForm referer={referer} />;
}

export default LoginPage;
