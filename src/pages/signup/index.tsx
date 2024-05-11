import { FormComponent, OtpInputForm } from "@/components";
import { SignupRedirect } from "@/components";
import { useHandleSignupMutation } from "@/hooks";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [inputErrorMsg, setInputErrorMsg] = useState<{
    [key: string]: string;
  }>({});
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [disableBtn, setDisableBtn] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const { email, name, password } = formData as {
    email: string;
    name: string;
    password: string;
  };

  const { sednVerificationEmail, verifytoken, submitInput } =
    useHandleSignupMutation({
      email,
      name,
      password,
      inputErrorMsg,
      setDisableBtn,
      setInputErrorMsg,
      setShowOtpInput,
    });

  // resend email if you dont get the email
  function resendEmail() {
    toast.loading("resending email", { id: "creating-token" });
    sednVerificationEmail({ email });
  }

  // on otp submit
  function onOtpSubmit(otp: string) {
    setDisableBtn(true);
    toast.loading("Verifying email", { id: "verifying-token" });
    const email = formData.email as string;
    verifytoken({ email, token: otp });
  }

  function onSubmit() {
    setInputErrorMsg({});
    submitInput({ name, email, password });
  }

  return (
    <div className="mt-[40px] flex w-screen justify-center">
      {!showOtpInput ? (
        <FormComponent
          disableBtn={disableBtn}
          formType="signup"
          formData={formData}
          setFormData={setFormData}
          title="create your account"
          cardHeight="691px"
          onSubmit={onSubmit}
          buttonText="create account"
          fields={[
            { name: "name", type: "text", errorMessage: inputErrorMsg.name },
            { name: "email", type: "text", errorMessage: inputErrorMsg.email },
            {
              name: "password",
              type: "text",
              errorMessage: inputErrorMsg.password,
            },
          ]}
          RedirectComponent={<SignupRedirect />}
        />
      ) : (
        <OtpInputForm
          resendEmail={resendEmail}
          errorMessage=""
          disableBtn={disableBtn}
          formData={formData}
          length={8}
          onOtpSubmit={onOtpSubmit}
        />
      )}
    </div>
  );
}
