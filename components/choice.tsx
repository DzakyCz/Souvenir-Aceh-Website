"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hideLabel?: boolean;
};

export function Choice({ label, value, onChange, options, hideLabel }: Props) {
  const labelId = useId();
  const safeValue = options.some((option) => option.value === value)
    ? value
    : options[0]?.value;
  return (
    <div className="choice">
      <span id={labelId} className={hideLabel ? "sr-only" : "choice-label"}>
        {label}
      </span>
      <Select.Root value={safeValue} onValueChange={onChange}>
        <Select.Trigger className="choice-trigger" aria-labelledby={labelId}>
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="choice-popover"
            position="popper"
            sideOffset={6}
            collisionPadding={12}
          >
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="choice-item"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={15} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
