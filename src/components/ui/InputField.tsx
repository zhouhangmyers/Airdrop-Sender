export interface InputFormProps {
    label: string
    placeholder: string
    value?: string
    type?: string
    large?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    className?: string
}

export function InputForm({ label, placeholder, value, type, large, onChange, className }: InputFormProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-orange-400 font-semibold tracking-wider text-base uppercase font-mono">{label}</label>
            {large ? (
                <textarea
                    className={className}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                />
            ) : (
                <input
                    className={className}
                    type={type}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                />
            )}
        </div>
    )
}