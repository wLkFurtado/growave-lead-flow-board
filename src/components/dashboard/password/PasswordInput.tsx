
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface PasswordInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  children?: React.ReactNode;
}

export const PasswordInput = <T extends FieldValues>({ 
  control, 
  name, 
  label, 
  placeholder, 
  children 
}: PasswordInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#00FF88]/80 font-medium">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                className="bg-slate-800/80 border-[#00FF88]/20 text-white pr-10 growave-neon-border placeholder:text-white/30"
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00FF88] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
          {children}
        </FormItem>
      )}
    />
  );
};
