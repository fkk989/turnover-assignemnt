import { FormComponent } from "@/components";
import { LoginRedirect } from "@/components";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [disableBtn, setDisableBtn] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [inputErrorMsg, setInputErrorMsg] = useState<{ [key: string]: string }>(
    {},
  );
  const { email, password } = formData as {
    email: string;
    password: string;
  };

  email && email.toLowerCase();
  const utils = api.useUtils();

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

  function onSubmit() {
    setDisableBtn(true);
    const { email, password } = formData as {
      email: string;
      password: string;
    };

    setInputErrorMsg({});
    mutate({ email: email, password });
  }
  return (
    <div className="mt-[40px] flex w-screen justify-center">
      <FormComponent
        disableBtn={disableBtn}
        formData={formData}
        setFormData={setFormData}
        title="Login"
        subTitle="welcome back to ECOMMERC"
        subTitle2="the next gen business marketplace"
        cardHeight="576px"
        onSubmit={onSubmit}
        buttonText="Login"
        fields={[
          { name: "email", type: "text", errorMessage: inputErrorMsg.email },
          {
            name: "password",
            type: "text",
            errorMessage: inputErrorMsg.password,
          },
        ]}
        RedirectComponent={<LoginRedirect />}
      />
    </div>
  );
}
