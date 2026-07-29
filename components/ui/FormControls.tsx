"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function FieldGroup({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><label className="label">{label}</label>{children}</div>;
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label: string;
  value: string;
  options?: readonly string[];
  onChange: (value: string) => void;
  children?: ReactNode;
};

export function SelectField({ label, value, options, onChange, children, ...props }: SelectFieldProps) {
  return <FieldGroup label={label}>
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props}>
      {children ?? options?.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </FieldGroup>;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextField({ label, value, onChange, ...props }: TextFieldProps) {
  return <FieldGroup label={label}>
    <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />
  </FieldGroup>;
}
