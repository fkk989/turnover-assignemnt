import { FormComponent } from "@/components";
import { LoginRedirect } from "@/components";
import { useHandleLoginQuery } from "@/hooks";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
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

  const { mutate, data } = useHandleLoginQuery({
    setDisableBtn,
    setInputErrorMsg,
    inputErrorMsg,
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
