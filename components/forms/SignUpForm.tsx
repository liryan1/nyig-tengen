"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { redirect, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Spinner } from "../labels/Spinner";
import { CircleAlertIcon, SquarePenIcon } from "lucide-react";
import { LogoWithText } from "../labels/Logo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useSignupMutation } from "@/lib/rtk/slices/auth";
import { toast } from "sonner";
import { logStack } from "@/lib/error";

export const signUpSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});
export type TSignUpForm = z.infer<typeof signUpSchema>;
const defaultValues = {
  name: "",
  email: "",
  password: "",
};

export function SignUpForm({ referer }: { referer?: string | null }) {
  const session = useSession();
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();

  useEffect(() => {
    if (session?.status === "authenticated") {
      redirect("/");
    }
  }, [session?.status, router]);

  const form = useForm<TSignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<TSignUpForm> = async (data) => {
    const signUpAndSignIn = async () => {
      const signupResponse = await signup(data);
      if (!signupResponse) {
        throw Error("Unknown Error");
      } else if (signupResponse.error) {
        const error = signupResponse.error as any;
        if (error.data) {
          form.setError("root", { message: error.data.message });
          throw Error(`Sign up failed due to: ${error.data.message}`);
        } else {
          throw Error("Sign up failed");
        }
      }

      const signinResponse = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signinResponse?.error) {
        throw Error(
          "Sign up successful, but auto login failed. Please log in manually.",
        );
      }
      if (referer) {
        window.location.href = referer;
      }
    };

    try {
      toast.promise(signUpAndSignIn, {
        loading: "Loading...",
        success: "Sign up successful",
        error: (err) => err.message,
      });
    } catch (error) {
      logStack(error);
    }
  };

  const buttonIcon = isLoading ? (
    <Spinner className="h-4 w-4" />
  ) : (
    <SquarePenIcon className="h-4 w-4" />
  );

  return (
    <div className="my-16 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div className="pb-6 sm:mx-auto sm:w-full sm:max-w-md">
          <LogoWithText text="Tengen" school="NYIG" />
        </div>
        <div className="pb-6">
          <p className="text-2xl">Sign Up</p>
          <p className="text-base text-muted-foreground">
            to join the Tengen Go community
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="flex items-center text-red-600 text-sm gap-1">
                <CircleAlertIcon className="h-4 w-4" />
                {form.formState.errors.root.message}
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} className="w-full" type="submit">
              Register
              {buttonIcon}
            </Button>
          </form>
        </Form>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 align-middle text-muted-foreground">
          <div className="flex items-center">Already have an account?</div>
          <Button variant="link" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
