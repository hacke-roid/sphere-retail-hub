type LoaderProps = {
  message?: string;
  variant?: "page" | "inline" | "button";
};

export const Loader = ({
  message = "Loading Sphere",
  variant = "page",
}: LoaderProps) => {
  if (variant === "button") {
    return (
      <span className="sphere-loader-button" aria-label={message}>
        <span />
      </span>
    );
  }

  return (
    <div className={`sphere-loader sphere-loader-${variant}`} role="status">
      <div className="sphere-loader-mark" aria-hidden="true">
        <span>S</span>
      </div>
      <div>
        <strong>Sphere</strong>
        <p>{message}</p>
      </div>
    </div>
  );
};
