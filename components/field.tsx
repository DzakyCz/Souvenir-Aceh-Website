import { useId, useState, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
type FieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  icon: LucideIcon;
  errorMessage: string;
};
export function Field({
  label,
  icon: Icon,
  errorMessage,
  onChange,
  ...props
}: FieldProps) {
  const id = useId(),
    [error, setError] = useState(false);
  return (
    <div className={"form-field" + (error ? " has-error" : "")}>
      <label htmlFor={id}>{label}</label>
      <div className="control-shell">
        <Icon size={17} />
        <input
          {...props}
          id={id}
          aria-invalid={error || undefined}
          aria-describedby={error ? id + "-error" : undefined}
          onInvalid={() => setError(true)}
          onBlur={(e) => setError(!e.target.validity.valid)}
          onChange={(e) => {
            if (error) setError(!e.target.validity.valid);
            onChange?.(e);
          }}
        />
      </div>
      {error && (
        <small id={id + "-error"} role="status">
          {errorMessage}
        </small>
      )}
    </div>
  );
}
