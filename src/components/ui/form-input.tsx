import * as React from 'react';
import { type Control, Controller } from 'react-hook-form';
import type { TextInputProps } from 'react-native';

import { Input } from './input';

interface FormInputProps extends TextInputProps {
  control: Control<any>;
  name: string;
}

export function FormInput({ control, name, ...props }: FormInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Input onChangeText={onChange} value={value} {...props} />
      )}
    />
  );
}
