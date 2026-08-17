'use client';
import ReactSelect, { StylesConfig, GroupBase } from 'react-select';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface AppSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  label?: string;
}

const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#00AFF1' : '#D1D5DB',
    borderRadius: '0.5rem',
    minHeight: '38px',
    fontSize: '0.875rem',
    boxShadow: state.isFocused ? '0 0 0 1px #00AFF1' : 'none',
    '&:hover': { borderColor: '#00AFF1' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#013253' : state.isFocused ? '#e0f7ff' : 'white',
    color: state.isSelected ? 'white' : '#0F172A',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({ ...base, color: '#9CA3AF', fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, fontSize: '0.875rem', color: '#0F172A' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function AppSelect({ options, value, onChange, placeholder = 'Seleccionar...', isDisabled = false, className }: AppSelectProps) {
  const selected = options.find(o => String(o.value) === String(value ?? '')) ?? null;

  return (
    <ReactSelect<SelectOption>
      options={options}
      value={selected}
      onChange={(opt) => onChange(opt ? String(opt.value) : '')}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={false}
      styles={customStyles}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      className={className}
      noOptionsMessage={() => 'Sin opciones'}
    />
  );
}
