import { SignUpForm } from "@/components/forms/SignUpForm";
import { headers } from "next/headers";
import React from "react";

async function SignUpPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  return <SignUpForm referer={referer} />;
}

export default SignUpPage;
