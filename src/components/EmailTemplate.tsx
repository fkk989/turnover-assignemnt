import * as React from "react";

interface EmailTemplateProps {
  token: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  token,
}) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "5px",
      }}
    >
      <h1 style={{ color: "#333", textAlign: "center" }}>
        Welcome to Turnover!
      </h1>
      <p style={{ color: "#333", textAlign: "center" }}>
        Your OTP for verification is:
      </p>
      <h2
        style={{
          color: "#007bff",
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        {token}
      </h2>
      <p style={{ color: "#333", textAlign: "center" }}>
        Please use this OTP to complete your verification process.
      </p>
    </div>
  );
};
