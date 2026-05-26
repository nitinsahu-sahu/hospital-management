import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { EyeCloseIcon, EyeIcon } from "../../icons";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

import { RootState } from "../../redux/store/store";
//@ts-ignore
import { login } from "../../redux/actions/auth.actions";
import ComponentCard from "../common/ComponentCard";
import Alert from "../ui/alert/Alert";


export default function SignInForm() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Track if navigation already happened
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { authenticate, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "nitinsahu911111@gmail.com",
    password: "vinod@!232",
  });

  // Redirect after login - only if user is authenticated and comes to signin page
  useEffect(() => {
    if (authenticate && !hasNavigated.current) {
      hasNavigated.current = true;
      // Use replace to prevent going back to signin
      navigate("/", { replace: true });
    }

    // Reset the ref when component unmounts or auth state changes
    return () => {
      hasNavigated.current = false;
    };
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
    setError("");
    setSuccess("");
    try {
      const response = await dispatch(login(formData));
      if (response?.type === "LOGIN_SUCCESS") {
        setSuccess(response.message);
        hasNavigated.current = true;
        navigate("/", { replace: true });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to login")
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
          {
            success && (
              <Alert
                variant="success"
                title="Success Message"
                message={success}
                showLink={false}
              />
            )
          }
          {
            error && (
              <Alert
                variant="error"
                title="Error Message"
                message={error}
                showLink={false}
              />
            )
          }
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