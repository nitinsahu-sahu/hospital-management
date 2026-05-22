import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { EyeCloseIcon, EyeIcon } from "../../icons";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

import { RootState } from "../../redux/store/store";
import { login } from "../../redux/actions/auth.actions";


export default function SignInForm() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { authenticate, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "nitinsahu911111@gmail.com",
    password: "vinod@!232",
  });

  // Redirect after login
  useEffect(() => {
    if (authenticate) {
      navigate("/");
    }
  }, [authenticate, navigate]);

  // Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await dispatch(login(formData));

    if (response?.type === "LOGIN_SUCCESS") {
      navigate("/");
    } else {
      alert(response?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">

                {/* Email */}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    type="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Button */}
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>

              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}

                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}