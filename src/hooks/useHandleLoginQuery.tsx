import React from "react";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface HandleLoginQueryProp {
  setDisableBtn: React.Dispatch<React.SetStateAction<boolean>>;
  setInputErrorMsg: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;
  inputErrorMsg: {
    [key: string]: string;
  };
}
export const useHandleLoginQuery = ({
  setInputErrorMsg,
  inputErrorMsg,
  setDisableBtn,
}: HandleLoginQueryProp) => {
  //util and router
  const utils = api.useUtils();
  const router = useRouter();

  const { mutate, data } = api.user.login.useMutation({
    onSuccess: () => {
      setDisableBtn(false);
      toast.success("successfull", { id: "user-login" });
      router.refresh();
      utils.user.getUser.invalidate();
    },
    onError: (e) => {
      setDisableBtn(false);
      const trpcError = e.shape?.message;
      const errorObj = e.data?.zodError?.fieldErrors;
      const emailError = errorObj && errorObj.email && errorObj.email[0];
      const passwordError =
        errorObj && errorObj.password && errorObj.password[0];
      let errorMessage;

      if (trpcError === "email") {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: "user not found with this email please signup first",
        });
      } else if (trpcError === "password") {
        setInputErrorMsg({
          ...inputErrorMsg,
          password: "Incorrect password",
        });
      } else if (trpcError === "server") {
        setInputErrorMsg({
          ...inputErrorMsg,
          passowrd: "server error please try again later",
        });
      } else if (emailError && passwordError) {
        errorMessage = `${emailError} ${passwordError}`;
        setInputErrorMsg({
          ...inputErrorMsg,
          email: emailError,
          password: passwordError,
        });
      } else if (emailError) {
        errorMessage = emailError;
        setInputErrorMsg({ ...inputErrorMsg, email: emailError });
      } else if (passwordError) {
        errorMessage = passwordError;
        setInputErrorMsg({ ...inputErrorMsg, password: passwordError });
      } else {
        setInputErrorMsg({
          ...inputErrorMsg,
          email: "Incorrect email or password ",
          password: "Incorrect password or email",
        });
      }
    },
  });

  return { mutate, data };
};
