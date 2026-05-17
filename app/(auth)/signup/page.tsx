import { SignUpForm } from "@/components/forms/SignUpForm";
import { Metadata } from "next";
import { headers } from "next/headers";
import React from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new NYIG Tengen account.",
};

async function SignUpPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  return <SignUpForm referer={referer} />;
}

export default SignUpPage;
