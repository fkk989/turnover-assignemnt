import {
  handleChange,
  handleClick,
  handleKeyDown,
  useHandlePaste,
} from "@/helpers";
import { useEffect, useRef, useState } from "react";

interface Prop {
  formData?: { [key: string]: string };
  length: number;
  resendEmail: () => void;
  onOtpSubmit: (otp: string) => void;
  disableBtn: any;
  errorMessage?: string;
}

export const OtpInputForm: React.FC<Prop> = ({
  formData,
  length,
  onOtpSubmit,
  disableBtn,
  resendEmail,
}) => {
  const [otp, setOtp] = useState<Array<string>>(new Array(length).fill(""));
  const [timer, setTimer] = useState(60);
  const inputsRefs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => {
    inputsRefs.current[0]?.focus();
  }, [inputsRefs]);

  const { handlePaste } = useHandlePaste({
    setOtp,
    inputsRefs,
    onOtpSubmit,
    length,
  });

  useEffect(() => {
    const timeoutId = setInterval(() => {
      console.log(timer);
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      } else {
        clearInterval(timeoutId);
      }
    }, 1000);

    return () => clearInterval(timeoutId);
  }, [timer]);

  return (
    <div className="flex h-[453px] w-[576px] flex-col items-center  gap-[40px] rounded-[20px] border border-[#C1C1C1] p-[30px]">
      <div className="flex flex-col items-center gap-[20px]">
        <h1 className="text-[32px] font-[600] capitalize">Verify your email</h1>
        <h3 className="w-[334px] text-center">
          Enter the 8 digit code you have received on{" "}
          {formData?.email?.substring(0, 3)}
          ***
          {formData?.email?.split("@")[1]}
        </h3>
      </div>
      <div className="flex flex-col items-center  gap-[60px]">
        <div className="flex flex-col gap-[5px]">
          <div>Code</div>
          <div className="flex items-center gap-[5px]">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                value={value}
                ref={(element) => {
                  inputsRefs.current.push(element);
                }}
                className="h-[52px] w-[52px] rounded-lg  border border-[#C1C1C1] text-center "
                onChange={(e) =>
                  handleChange({
                    otp,
                    setOtp,
                    inputsRefs,
                    onOtpSubmit,
                    index,
                    e,
                    length,
                  })
                }
                onPaste={handlePaste}
                onClick={() => handleClick({ otp, inputsRefs, index })}
                onKeyDown={(e) =>
                  handleKeyDown({
                    otp,
                    inputsRefs,
                    index,
                    e,
                    length,
                    onOtpSubmit,
                  })
                }
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[20px] ">
          <button
            disabled={disableBtn}
            onClick={() => {
              const combinedOpt = otp.join("");
              if (combinedOpt.length === length) {
                onOtpSubmit(combinedOpt);
              }
            }}
            className={
              "h-[56px] w-[456px] rounded-[6px] bg-black text-center uppercase tracking-[1px] text-white"
            }
            style={{
              backgroundColor: disableBtn ? "#000000ad" : "",
            }}
            type="submit"
          >
            verify
          </button>
          <button>
            Resedn email after {timer > 0 && `${timer}`} seconds{" "}
            <button
              className=" text-[19px] font-[500] text-sky-400"
              disabled={timer === 0 ? false : true}
              onClick={() => {
                setTimer(60);
                resendEmail();
              }}
            >
              Resend
            </button>
          </button>
        </div>
      </div>
    </div>
  );
};
