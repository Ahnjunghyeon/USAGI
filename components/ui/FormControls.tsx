"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

type FieldGroupProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
};

export function FieldGroup({ id, label, children, className = "", helpText, errorText, required }: FieldGroupProps) {
  const message = errorText ?? helpText;
  const messageId = message ? `${id}-message` : undefined;
  return (
    <div className={["field-group", className].filter(Boolean).join(" ")}>
      <label className="label" htmlFor={id}>
        {label}{required && <span className="field-required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {message && (
        <p id={messageId} className={errorText ? "field-message field-error" : "field-message"} role={errorText ? "alert" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label: string;
  value: string;
  options?: readonly string[];
  onChange: (value: string) => void;
  children?: ReactNode;
  helpText?: string;
  errorText?: string;
  containerClassName?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  children,
  helpText,
  errorText,
  containerClassName,
  id: suppliedId,
  required,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? `select-${generatedId.replace(/:/g, "")}`;
  const describedBy = errorText || helpText ? `${id}-message` : props["aria-describedby"];
  return (
    <FieldGroup id={id} label={label} className={containerClassName} helpText={helpText} errorText={errorText} required={required}>
      <select
        id={id}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(errorText) || undefined}
        aria-describedby={describedBy}
        required={required}
        {...props}
      >
        {children ?? options?.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </FieldGroup>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
  errorText?: string;
  containerClassName?: string;
};

export function TextField({
  label,
  value,
  onChange,
  helpText,
  errorText,
  containerClassName,
  id: suppliedId,
  required,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? `input-${generatedId.replace(/:/g, "")}`;
  const describedBy = errorText || helpText ? `${id}-message` : props["aria-describedby"];
  return (
    <FieldGroup id={id} label={label} className={containerClassName} helpText={helpText} errorText={errorText} required={required}>
      <input
        id={id}
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(errorText) || undefined}
        aria-describedby={describedBy}
        required={required}
        {...props}
      />
    </FieldGroup>
  );
}
