import React from "react";
import AuthForm from "./Auth-form";

const AuthPage: React.FC = () => {
  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Welcome to SteadyClick</h1>
      <AuthForm />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#e3f2fd",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#333",
  },
};

export default AuthPage;
