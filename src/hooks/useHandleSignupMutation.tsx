import { api } from "@/utils/api";
import React, { SetStateAction } from "react";
import toast from "react-hot-toast";
import { HandleLoginQueryProp } from "./useHandleLoginQuery";
import { useRouter } from "next/navigation";

interface HandleSignupMutationProp extends HandleLoginQueryProp {
  email: string;
  name: string;
  password: string;
  setShowOtpInput: React.Dispatch<SetStateAction<boolean>>;
}

export const useHandleSignupMutation = ({
  setInputErrorMsg,
  inputErrorMsg,
  setDisableBtn,
  email,
  name,
  password,
  setShowOtpInput,
}: HandleSignupMutationProp) => {
  // input validation by sending it to the backed

  const utils = api.useUtils();
  const router = useRouter();

  const { mutate: submitInput } = api.user.submitInput.useMutation({
    onSuccess: () => {
      toast.loading("sending email", { id: "creating-token" });
      sednVerificationEmail({ email });
    },
    onError: (e) => {
      const trpcError = e.shape?.message;
      const errorObj = e.data?.zodError?.fieldErrors;
      const emailError = errorObj && errorObj.email && errorObj.email[0];
      const nameError = errorObj && errorObj.name && errorObj.name[0];
      const passwordError =
        errorObj && errorObj.password && errorObj.password[0];
      console.log(typeof trpcError);
      if (trpcError === "email") {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: "user already exits with this email",
        });
      } else if (emailError && passwordError && nameError) {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: emailError,
          password: passwordError,
          name: nameError,
        });
      } else if (emailError && passwordError) {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: emailError,
          password: passwordError,
        });
      } else if (emailError && nameError) {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: emailError,
          name: nameError,
        });
      } else if (nameError && passwordError) {
        setInputErrorMsg({
          ...inputErrorMsg,
          name: nameError,
          password: passwordError,
        });
      } else if (emailError) {
        setInputErrorMsg({ ...inputErrorMsg, email: emailError });
      } else if (passwordError) {
        setInputErrorMsg({ ...inputErrorMsg, password: passwordError });
      } else if (nameError) {
        setInputErrorMsg({ ...inputErrorMsg, name: nameError });
      } else {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: "Incorrect email or password",
          password: "Incorrect email or password",
        });
      }
    },
  });

  // user creation

  const { mutate: createUser } = api.user.create.useMutation({
    onSuccess: () => {
      toast.success("Signed up successfully", { id: "verifying-token" });
      setDisableBtn(false);
      utils.user.getUser.invalidate();
      router.refresh();
    },
    onError: () => {
      // since all the error are handled so it will be just a server error
      toast.success("server error please try again later", {
        id: "verifying-token",
      });
    },
  });

  //  send verification email
  const { mutate: sednVerificationEmail } =
    api.userVerification.create.useMutation({
      onSuccess: () => {
        setShowOtpInput(true);
        toast.success("Success", { id: "creating-token" });
      },
      onError: (e) => {
        toast.error("Error", { id: "creating-token" });
      },
    });

  // token verification
  const { mutate: verifytoken } = api.userVerification.verifyToken.useMutation({
    onSuccess: () => {
      createUser({ name, email, password });
    },
    onError: (e) => {
      const stackobjErr = e.data?.stack && e.data.stack;
      if (stackobjErr) {
        toast.error("Incorrect Otp", { id: "verifying-token" });
      }
    },
  });

  return { submitInput, createUser, sednVerificationEmail, verifytoken };
};
