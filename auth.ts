interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;  // JWT token (Optional)
}

// একটি ফাংশন যা লগইন প্রক্রিয়া সম্পাদন করবে
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch("https://your-api-endpoint.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "Login successful!",
        token: data.token,  // যদি token পাঠানো হয়
      };
    } else {
      return {
        success: false,
        message: data.message || "Something went wrong.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error, please try again later.",
    };
  }
};

// একটি ফাংশন যা সাইনআপ প্রক্রিয়া সম্পাদন করবে
export const signup = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch("https://your-api-endpoint.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "Signup successful!",
      };
    } else {
      return {
        success: false,
        message: data.message || "Something went wrong.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error, please try again later.",
    };
  }
};

// Token দিয়ে লগ আউট ফাংশন
export const logout = () => {
  localStorage.removeItem("authToken");
  console.log("Logged out successfully.");
};
