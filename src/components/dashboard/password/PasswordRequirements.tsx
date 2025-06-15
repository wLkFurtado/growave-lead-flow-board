
import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements: PasswordRequirement[] = [
    { label: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-slate-400">Requisitos da senha:</p>
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            {req.met ? (
              <Check className="w-4 h-4 text-[#00FF88]" />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs ${req.met ? 'text-[#00FF88]' : 'text-slate-400'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
