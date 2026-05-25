import { useState } from "react";

interface PatientImageProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PatientImage({
  src,
  alt = "Patient",
  name,
  size = "md",
  className = "",
}: PatientImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-16 h-16 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If no image source or image failed to load, show initials
  if (!src || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse`}
        />
      )}
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoading(false)}
        className={`${sizeClasses[size]} rounded-full object-cover ${
          imageLoading ? "absolute inset-0 opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      />
    </div>
  );
}