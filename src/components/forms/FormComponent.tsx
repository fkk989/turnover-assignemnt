import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaRegEyeSlash } from "react-icons/fa";

interface Prop {
  formType?: string;
  formData: {
    [key: string]: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;
  title: string;
  subTitle?: string;
  subTitle2?: string;
  cardHeight: string;
  fields: Array<{ name: string; type: string; errorMessage?: string }>;
  formStyle?: string;
  inputStyle?: string;
  buttonStyle?: string;
  buttonText: string;
  onSubmit: (formData: any) => void;
  RedirectComponent: React.ReactNode;
  disableBtn: boolean;
}

export const FormComponent: React.FC<Prop> = ({
  formType,
  formData,
  setFormData,
  title,
  subTitle,
  subTitle2,
  cardHeight,
  fields,
  inputStyle,
  buttonStyle,
  buttonText,
  onSubmit,
  RedirectComponent,
  disableBtn,
}) => {
  const [passwordType, setPasswordType] = useState<"text" | "password">(
    "password",
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
    // resetting form data on submit
  };

  return (
    <div
      className="box-border flex  w-[576px] flex-col items-center gap-[20px] rounded-[20px] border border-[#C1C1C1] p-[30px]"
      style={{
        minHeight: cardHeight,
      }}
    >
      <h1 className="text-[32px] font-[600] capitalize">{title}</h1>
      <div className="text-center">
        <h3 className="text-[25px] font-[400]">{subTitle}</h3>
        <h2 className="text-[16px] capitalize">{subTitle2}</h2>
      </div>
      <form className="box-border flex flex-col items-center gap-[40px] p-[30px]">
        <div className="flex flex-col gap-[20px]">
          {fields.map(({ name: inputName, type, errorMessage }) => {
            return (
              <div
                className="flex w-[456px] flex-col gap-[5px]"
                key={inputName}
              >
                <label htmlFor={inputName} className="capitalize">
                  {inputName}
                </label>
                {inputName.toLowerCase() === "password" ? (
                  <div>
                    <div className="relative flex w-[100%] flex-col items-center gap-[10px]">
                      <input
                        id={inputName}
                        type={passwordType}
                        name={inputName}
                        placeholder={"Enter"}
                        value={formData.inputName}
                        onChange={handleChange}
                        className={
                          inputStyle ??
                          "box-border h-[50px] w-[100%] rounded-[6px] border border-[#C1C1C1] p-[15px] outline-none"
                        }
                      />

                      {passwordType === "password" ? (
                        <FaEye
                          onClick={() => {
                            setPasswordType("text");
                          }}
                          className="text-wite hover:text-[#2e2e2e absolute right-[10px] top-[50%] translate-y-[-50%] cursor-pointer text-[25px] text-black"
                        />
                      ) : (
                        <FaEyeSlash
                          onClick={() => {
                            setPasswordType("password");
                          }}
                          className="text-wite hover:text-[#2e2e2e absolute right-[10px] top-[50%] translate-y-[-50%] cursor-pointer text-[25px] text-black"
                        />
                      )}
                    </div>
                    <div className="text-[#FF4B4B]">{errorMessage}</div>
                    {formType === "signup" && (
                      <div className="mt-[30px] text-[14px]">
                        note: password should consist minimun 8 character , one
                        lowercase, uppercase,special character and must have one
                        digit{" "}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      className={
                        inputStyle ??
                        "box-border h-[50px] w-[100%] rounded-[6px] border border-[#C1C1C1] p-[15px] outline-none"
                      }
                      id={inputName}
                      type={type}
                      name={inputName}
                      placeholder={"Enter"}
                      value={formData.inputName}
                      onChange={handleChange}
                    />
                    <div className=" text-[#FF4B4B]">{errorMessage}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-[20px]">
          <button
            disabled={disableBtn}
            onClick={handleSubmit}
            className={
              buttonStyle ??
              "h-[56px] w-[456px] rounded-[6px] bg-black text-center uppercase tracking-[1px] text-white"
            }
          >
            {buttonText}
          </button>
          <div className="h-[1px] w-[456px] bg-[#C1C1C1]"></div>
          <div>{RedirectComponent}</div>
        </div>
      </form>
    </div>
  );
};
