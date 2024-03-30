import { FormComponent, OtpInputForm } from "@/components";
import { SignupRedirect } from "@/components";
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

  useEffect(() => {
    console.log(inputErrorMsg);
  }, [inputErrorMsg]);
  // input validation by sending it to the backed
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
      toast.success("email verified", { id: "verifying-token" });
      setDisableBtn(false);
      utils.user.getUser.invalidate();
      router.refresh();
    },
    onError: () => {},
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
