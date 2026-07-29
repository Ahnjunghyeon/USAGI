"use client";

import { SelectField } from "@/components/ui/FormControls";
import { MBTI_GROUPS, type MbtiValue } from "@/lib/mbti";

export default function MbtiSelect({ value, onChange, label = "MBTI", disabled = false }: { value: MbtiValue; onChange: (value: MbtiValue) => void; label?: string; disabled?: boolean }) {
  return <SelectField label={label} value={value} disabled={disabled} onChange={(next) => onChange(next as MbtiValue)}>
    <option value="모름">모름</option>
    {MBTI_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>
      {group.types.map((type) => <option value={type} key={type}>{type}</option>)}
    </optgroup>)}
  </SelectField>;
}
