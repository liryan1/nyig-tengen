import { TSignUpForm } from "@/components/forms/SignUpForm";
import { apiSlice } from "../api";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<void, TSignUpForm>({
      query: (body) => ({
        url: "auth/signup",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
} = authApi;
