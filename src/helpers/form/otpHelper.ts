import { useCallback } from "react";

export const handleChange = (prop: {
  otp: any;
  setOtp: any;
  inputsRefs: any;
  onOtpSubmit: any;
  index: number;
  e: any;
  length: number;
}) => {
  if (prop.e.nativeEvent.inputType === "insertFromPaste") return;
  const value = prop.e.target.value;
  if (isNaN(value)) return;
  const newOtp = [...prop.otp];

  // allow only one last input
  newOtp[prop.index] = value.substring(value.length - 1);
  prop.setOtp(newOtp);

  // move to next input if current field is filled
  if (
    value &&
    prop.index != prop.length - 1 &&
    prop.inputsRefs.current[prop.index + 1]
  ) {
    prop.inputsRefs.current[prop.index + 1]?.focus();
  }

  // submit trigger
  const combinedOpt = newOtp.join("");

  if (combinedOpt.length === prop.length) {
    prop.onOtpSubmit(combinedOpt);
  }
};

export const useHandlePaste = (prop: {
  setOtp: any;
  inputsRefs: any;
  onOtpSubmit: any;
  length: number;
}) => {
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedData = e.clipboardData.getData("text/plain");
      const numericRegex = /^\d+$/;
      if (!numericRegex.test(pastedData)) {
        // If pasted data contains non-numeric characters, return
        return;
      }

      if (pastedData.length === prop.length) {
        // If pasted data length matches the OTP length, update OTP state
        prop.setOtp(pastedData.split("").slice(0, prop.length));

        // Focus on the last input field after setting OTP
        prop.inputsRefs.current[prop.length - 1]?.focus();
      }

      // Combine OTP digits and submit if OTP is complete
      const combinedOpt = pastedData.slice(0, prop.length);
      if (combinedOpt.length === prop.length) {
        prop.onOtpSubmit(combinedOpt);
      }
    },
    [prop.length, prop.setOtp, prop.onOtpSubmit],
  );
  return { handlePaste };
};

export const handleClick = (prop: {
  otp: any;
  inputsRefs: any;
  index: number;
}) => {
  prop.inputsRefs.current[prop.index]?.setSelectionRange(1, 1);
  if (prop.index > 0 && !prop.otp[prop.index - 1]) {
    prop.inputsRefs.current[prop.otp.indexOf("")]?.focus();
  }
  if (prop.index > 0 && prop.otp[prop.index]) {
    prop.inputsRefs.current[prop.otp.indexOf("")]?.focus();
  }
};

export const handleKeyDown = (prop: {
  onOtpSubmit: any;
  otp: any;
  inputsRefs: any;
  index: any;
  e: any;
  length: number;
}) => {
  if (prop.e.key === "Enter") {
    const combinedOpt = prop.otp.join("");
    if (combinedOpt.length === prop.length) {
      prop.onOtpSubmit(combinedOpt);
    }
  }
  if (
    prop.e.key === "Backspace" &&
    !prop.otp[prop.index] &&
    prop.index > 0 &&
    prop.inputsRefs.current[prop.index - 1]
  ) {
    // Move focus to the previous input field on backspace
    prop.inputsRefs?.current[prop.index - 1]?.focus();
  }
};
