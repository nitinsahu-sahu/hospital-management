interface StepperProps {
  currentStep: number;
  steps: { label: string; step: number }[];
}

export default function RegistrationStepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStep >= step.step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.step}
              </div>
              <span className="ml-2 text-sm font-medium dark:text-white">
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-1 w-20 ${
                  currentStep > step.step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}